import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Households.css';

function HouseholdMembers() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeInviteCode, setActiveInviteCode] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);

  useEffect(() => {
    fetchHouseholdData();
  }, [id]);

  const fetchHouseholdData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch household details
      const householdResponse = await api.get(`/api/households/${id}`);
      setHousehold(householdResponse.data);
      
      // Fetch household members
      const membersResponse = await api.get(`/api/households/${id}/members`);
      setMembers(membersResponse.data || []);
      
      // Fetch active invites if user is the creator
      if (householdResponse.data.creator_id === user.id) {
        const invitesResponse = await api.get(`/api/households/${id}/invites`);
        setInvites(invitesResponse.data || []);
        
        // Find an active invite code
        const activeInvite = invitesResponse.data.find(invite => 
          invite.is_active && new Date(invite.expires_at) > new Date()
        );
        
        if (activeInvite) {
          setActiveInviteCode(activeInvite.invite_code);
        }
      }
    } catch (err) {
      console.error('Error fetching household data:', err);
      setError('Failed to load household data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const createInvite = async (expiresInDays = 7) => {
    try {
      const response = await api.post(`/api/households/${id}/invites`, {
        expires_in_days: expiresInDays
      });
      
      // Update invites list
      setInvites(prev => [...prev, response.data]);
      setActiveInviteCode(response.data.invite_code);
      setShowInviteForm(false);
    } catch (err) {
      console.error('Error creating invite:', err);
      setError('Failed to create invite. Please try again later.');
    }
  };

  if (isLoading) {
    return (
      <div className="household-loading">
        <div className="loading-spinner"></div>
        <p>Loading household data...</p>
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

  const isCreator = household.creator_id === user.id;

  return (
    <div className="household-details">
      <div className="household-header">
        <div>
          <h1 className="household-title">{household.name}</h1>
          <p className="household-meta">
            Created by {household.creator_name} on {format(new Date(household.created_at), 'MMMM dd, yyyy')}
          </p>
        </div>
        
        <div className="household-actions">
          <Link to={`/transactions?household_id=${id}`} className="btn btn-secondary">
            View Transactions
          </Link>
          
          {isCreator && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowInviteForm(!showInviteForm)}
            >
              {activeInviteCode ? 'Manage Invites' : 'Invite Members'}
            </button>
          )}
        </div>
      </div>
      
      {showInviteForm && isCreator && (
        <div className="card invite-card">
          <h3>Invite Members</h3>
          
          {activeInviteCode ? (
            <div className="active-invite">
              <p>Share this invite code with people you want to join this household:</p>
              <div className="invite-code-display">
                <span className="invite-code">{activeInviteCode}</span>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(activeInviteCode);
                    alert('Invite code copied to clipboard!');
                  }}
                >
                  Copy
                </button>
              </div>
              
              <div className="invite-expiry">
                {invites.find(i => i.invite_code === activeInviteCode)?.expires_at && (
                  <p>
                    Expires: {format(
                      new Date(invites.find(i => i.invite_code === activeInviteCode).expires_at), 
                      'MMMM dd, yyyy'
                    )}
                  </p>
                )}
              </div>
              
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => createInvite(7)}
              >
                Generate New Code
              </button>
            </div>
          ) : (
            <div className="create-invite-form">
              <p>Create an invite code to allow others to join this household:</p>
              
              <div className="invite-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => createInvite(7)}
                >
                  Create 7-Day Invite
                </button>
                
                <button 
                  className="btn btn-secondary"
                  onClick={() => createInvite(30)}
                >
                  Create 30-Day Invite
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="card">
        <h2 className="card-header">Members ({members.length})</h2>
        
        <div className="members-table-container">
          <table className="table members-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Joined Date</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.user_id}>
                  <td>{member.username}</td>
                  <td>{member.email}</td>
                  <td>{format(new Date(member.joined_at), 'MMM dd, yyyy')}</td>
                  <td>
                    {member.user_id === household.creator_id ? (
                      <span className="member-role creator">Creator</span>
                    ) : (
                      <span className="member-role member">Member</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HouseholdMembers;