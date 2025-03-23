import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../services/api';
import '../../styles/Households.css';

function HouseholdsList({ households: initialHouseholds = null, showCreateButton = true }) {
  const [households, setHouseholds] = useState(initialHouseholds || []);
  const [isLoading, setIsLoading] = useState(initialHouseholds === null);
  const [error, setError] = useState(null);

  // Fetch households from API if not provided
  useEffect(() => {
    if (initialHouseholds === null) {
      fetchHouseholds();
    }
  }, [initialHouseholds]);

  const fetchHouseholds = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/api/households');
      setHouseholds(response.data || []);
    } catch (err) {
      console.error('Error fetching households:', err);
      setError('Failed to load households. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="households-loading">
        <div className="loading-spinner"></div>
        <p>Loading households...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
      </div>
    );
  }

  if (households.length === 0) {
    return (
      <div className="households-empty">
        <p>You don't have any households yet.</p>
        {showCreateButton && (
          <Link to="/households/new" className="btn btn-primary">
            Create Household
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="households-list">
      <div className="households-grid">
        {households.map(household => (
          <Link 
            to={`/households/${household.id}`} 
            key={household.id}
            className="household-card"
          >
            <div className="household-card-header">
              <h3 className="household-name">{household.name}</h3>
              <div className="member-count">
                {household.member_count || '1'} members
              </div>
            </div>
            
            <div className="household-card-content">
              <div className="household-creator">
                Created by: {household.creator_name}
              </div>
              <div className="household-created-date">
                {format(new Date(household.created_at), 'MMM dd, yyyy')}
              </div>
            </div>
            
            <div className="household-actions">
              <span className="view-details">View Details</span>
            </div>
          </Link>
        ))}
      </div>
      
      {showCreateButton && (
        <div className="households-create">
          <Link to="/households/new" className="btn btn-primary">
            Create New Household
          </Link>
        </div>
      )}
    </div>
  );
}

export default HouseholdsList;