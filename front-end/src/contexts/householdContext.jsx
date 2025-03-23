import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const HouseholdContext = createContext();

export function useHousehold() {
  return useContext(HouseholdContext);
}

export function HouseholdProvider({ children }) {
  const { isAuthenticated } = useAuth();
  
  const [households, setHouseholds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch households when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchHouseholds();
    } else {
      setHouseholds([]);
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  
  const fetchHouseholds = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/api/households');
      setHouseholds(response.data || []);
    } catch (err) {
      console.error('Error fetching households:', err);
      setError('Failed to load households');
    } finally {
      setIsLoading(false);
    }
  };
  
  const createHousehold = async (householdData) => {
    try {
      const response = await api.post('/api/households', householdData);
      setHouseholds(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error('Error creating household:', err);
      throw err;
    }
  };
  
  const getHousehold = async (id) => {
    try {
      // Check if we already have it
      const existing = households.find(h => h.id === parseInt(id));
      if (existing) return existing;
      
      // Otherwise fetch it
      const response = await api.get(`/api/households/${id}`);
      return response.data;
    } catch (err) {
      console.error(`Error fetching household ${id}:`, err);
      throw err;
    }
  };
  
  const joinHousehold = async (inviteCode) => {
    try {
      const response = await api.post(`/api/households/join/${inviteCode}`);
      await fetchHouseholds(); // Refresh list
      return response.data;
    } catch (err) {
      console.error('Error joining household:', err);
      throw err;
    }
  };
  
  const createInvite = async (householdId, expiresInDays) => {
    try {
      const response = await api.post(`/api/households/${householdId}/invites`, {
        expires_in_days: expiresInDays
      });
      return response.data;
    } catch (err) {
      console.error('Error creating invite:', err);
      throw err;
    }
  };
  
  const value = {
    households,
    isLoading,
    error,
    refreshHouseholds: fetchHouseholds,
    createHousehold,
    getHousehold,
    joinHousehold,
    createInvite
  };
  
  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
}