import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import '../../styles/Auth.css';

function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Loading profile...</div>;
  }

  // Get the first letter of the username for avatar
  const avatarLetter = user.username ? user.username[0].toUpperCase() : '?';
  
  // Format the date
  const formattedDate = format(new Date(user.created_at), 'MMMM dd, yyyy');

  return (
    <div className="profile-container">
      <div className="card">
        <div className="profile-header">
          <div className="profile-avatar">
            {avatarLetter}
          </div>
          <div>
            <h2 className="profile-name">{user.username}</h2>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>
        
        <div className="profile-info">
          <div className="form-group">
            <label>User ID</label>
            <p>{user.id}</p>
          </div>
          
          <div className="form-group">
            <label>Joined On</label>
            <p>{formattedDate}</p>
          </div>
        </div>
        
        <div className="profile-actions">
          <button className="btn btn-danger" onClick={logout}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;