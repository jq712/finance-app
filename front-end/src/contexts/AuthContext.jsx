import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const { 
    isLoading, 
    isAuthenticated, 
    loginWithRedirect, 
    logout: auth0Logout, 
    user,
    getAccessTokenSilently 
  } = useAuth0();
  
  const [userData, setUserData] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Set up API token when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      const setupUser = async () => {
        try {
          // Get token from Auth0
          console.log('Authenticated with Auth0, requesting token...');
          console.log('Auth0 user:', user.sub);
          
          try {
            const token = await getAccessTokenSilently({
              authorizationParams: {
                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                scope: 'openid profile email'
              }
            });
            
            console.log('Token received from Auth0, length:', token.length);
            console.log('Token starts with:', token.substring(0, 20) + '...');
            
            // Set token for API requests
            api.setAuthToken(token);
            
            console.log("Authentication successful, token obtained and stored");
            
            // Check if user profile exists in our API
            try {
              console.log('Fetching user profile from backend...');
              const response = await api.get('/api/auth/me');
              console.log("User profile retrieved:", response.data);
              setUserData(response.data);
            } catch (error) {
              console.error("Error retrieving user profile:", 
                error.response?.status, 
                error.response?.data || error.message
              );
              
              // User not registered in our system yet
              if (error.response && error.response.status === 404) {
                // Register user in our system
                const newUser = {
                  username: user.nickname || user.name || user.email.split('@')[0],
                  email: user.email
                };
                
                console.log("Registering new user:", newUser);
                
                try {
                  const response = await api.post('/api/auth/register', newUser);
                  console.log("User registered successfully:", response.data);
                  setUserData(response.data);
                } catch (registerError) {
                  console.error("Failed to register user:", 
                    registerError.response?.status,
                    registerError.response?.data || registerError.message
                  );
                  setAuthError(`Registration failed: ${registerError.response?.data?.error || registerError.message}`);
                }
              } else {
                setAuthError(`Profile retrieval failed: ${error.response?.data?.error || error.message}`);
              }
            }
          } catch (tokenError) {
            console.error("Failed to get access token:", tokenError);
            setAuthError(`Failed to get access token: ${tokenError.message}`);
          }
          
          setAuthReady(true);
        } catch (error) {
          console.error('Auth setup error:', 
            error.response?.status, 
            error.response?.data || error.message
          );
          setAuthError(`Failed to connect to server: ${error.response?.data?.error || error.message}`);
          setAuthReady(true);
        }
      };
      
      setupUser();
    } else if (!isLoading) {
      setAuthReady(true);
    }
  }, [isAuthenticated, user, getAccessTokenSilently, isLoading]);

  // Custom logout that clears local state
  const logout = () => {
    auth0Logout({
      returnTo: window.location.origin
    });
    setUserData(null);
    api.clearAuthToken();
  };

  const value = {
    isLoading: isLoading || !authReady,
    isAuthenticated,
    user: userData,
    login: (options = {}) => {
      const defaultOptions = {
        authorizationParams: {
          redirect_uri: window.location.origin
        }
      };
      return loginWithRedirect({
        ...defaultOptions,
        ...options,
        authorizationParams: {
          ...defaultOptions.authorizationParams,
          ...(options.authorizationParams || {})
        }
      });
    },
    logout,
    authError,
    refreshUserData: async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await api.get('/api/auth/me');
        setUserData(response.data);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}