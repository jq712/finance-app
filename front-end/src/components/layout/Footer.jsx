import React from 'react';
import '../../styles/Layout.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <p>© {currentYear} Finance App</p>
          <div className="footer-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Help</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;