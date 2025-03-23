import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Layout.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const avatarLetter = user && user.username ? user.username[0].toUpperCase() : '?';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/dashboard">Finance App</Link>
        </div>
        
        <div className="navbar-menu-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <div className={`navbar-menu ${isMenuOpen ? 'is-active' : ''}`}>
          <div className="navbar-end">
            <div className="navbar-item has-dropdown">
              <div className="user-profile-mini" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <div className="avatar-mini">{avatarLetter}</div>
                {user && <span>{user.username}</span>}
              </div>
              
              <div className={`navbar-dropdown ${isMenuOpen ? 'is-active' : ''}`}>
                <Link to="/profile" className="navbar-item" onClick={() => setIsMenuOpen(false)}>
                  Profile
                </Link>
                <hr className="navbar-divider" />
                <a href="#" className="navbar-item" onClick={handleLogout}>
                  Log Out
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;