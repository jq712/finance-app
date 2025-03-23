import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { format, addDays } from 'date-fns';

function InviteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Form state
  const [expiresInDays, setExpiresInDays] = useState(7);
  
  // UI state
  const [household, setHousehold] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [inviteCode, setInviteCode] = useState(null);
  
  // Fetch household data
  useEffect(() => {
    const fetchHousehold = async () => {
      try {
        const response = await api.get(`/api/households/${id}`);
        setHousehold(response.data);
      } catch (err) {
        console.error('Error fetching household:', err);
        setError('Failed to load household data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHousehold();
  }, [id]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create the invite
      const response = await api.post(`/api/households/${id}/invites`, {
        expires_in_days: expiresInDays
      });
      
      setInviteCode(response.data.invite_code);
    } catch (err) {
      console.error('Error creating invite:', err);
      setError(err.message || 'Failed to create invite. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      alert('Invite code copied to clipboard!');
    }
  };
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading household data...</p>
      </div>
    );
  }
  
  if (!household) {
    return (
      <div className="household-not-found">
        <h2>Household Not Found</h2>
        <p>The household you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/households" className="btn btn-primary">
          Back to Households
        </Link>
      </div>
    );
  }
  
  return (
    <div className="invite-form-container">
      <div className="form-header">
        <h2>Create Invite for {household.name}</h2>
        <p>
          Generate an invite code to allow others to join this household.
        </p>
      </div>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      {inviteCode ? (
        <div className="card invite-result">
          <h3>Invite Code Created!</h3>
          
          <div className="invite-code-display">
            <span className="invite-code">{inviteCode}</span>
            <button 
              onClick={copyInviteCode}
              className="btn btn-secondary btn-sm"
            >
              Copy
            </button>
          </div>
          
          <div className="invite-details">
            <p>
              <strong>Expires:</strong> {format(addDays(new Date(), expiresInDays), 'MMMM dd, yyyy')}
            </p>
            <p className="text-sm text-secondary">
              Share this code with people you want to join your household.
              They can enter it when joining a household.
            </p>
          </div>
          
          <div className="form-footer">
            <Link to={`/households/${id}`} className="btn btn-secondary">
              Back to Household
            </Link>
            <button
              onClick={() => setInviteCode(null)}
              className="btn btn-primary"
            >
              Create Another Invite
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card invite-form">
          <div className="form-group">
            <label htmlFor="expiresInDays">Invite Expiration</label>
            <select
              id="expiresInDays"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
            <p className="form-help">
              Choose how long this invite code will be valid.
            </p>
          </div>
          
          <div className="form-footer">
            <Link to={`/households/${id}`} className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Generate Invite Code'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default InviteForm;