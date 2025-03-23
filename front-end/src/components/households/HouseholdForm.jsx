import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

function HouseholdForm() {
  const navigate = useNavigate();
  
  // Form state
  const [name, setName] = useState('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create the household
      const response = await api.post('/api/households', { name });
      
      // Navigate to the new household page
      navigate(`/households/${response.data.id}`);
    } catch (err) {
      console.error('Error creating household:', err);
      setError(err.message || 'Failed to create household. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="household-form-container">
      <div className="form-header">
        <h2>Create New Household</h2>
        <p>
          Create a household to share expenses with family members or roommates.
        </p>
      </div>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="card household-form">
        <div className="form-group">
          <label htmlFor="name">Household Name</label>
          <input
            type="text"
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Family Budget, Apartment 3B"
          />
          <p className="form-help">
            Choose a name that clearly identifies this household for all members.
          </p>
        </div>
        
        <div className="form-footer">
          <Link to="/households" className="btn btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Household'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default HouseholdForm;