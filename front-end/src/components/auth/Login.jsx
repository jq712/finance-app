import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Auth.css';

function Login() {
  const { login, isLoading, authError } = useAuth();

  const handleSignIn = () => {
    login();
  };

  const handleSignUp = () => {
    login({
      authorizationParams: {
        screen_hint: 'signup'
      }
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Finance App</h1>
          <p className="login-subtitle">Track expenses, manage budgets, and share with your household</p>
        </div>
        
        {authError && (
          <div className="alert alert-error">
            {authError}
          </div>
        )}
        
        <div className="auth-buttons">
          <button 
            className="btn btn-primary login-btn" 
            onClick={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Sign In'}
          </button>
          
          <button 
            className="btn btn-secondary signup-btn" 
            onClick={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Sign Up'}
          </button>
        </div>
        
        <div className="login-features">
          <h3>Features</h3>
          <ul>
            <li>Track your personal expenses</li>
            <li>Create and manage multiple households</li>
            <li>Share expenses with household members</li>
            <li>Visualize spending patterns</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;