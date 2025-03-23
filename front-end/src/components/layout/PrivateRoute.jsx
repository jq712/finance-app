import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from './Navbar';
import SideMenu from './SideMenu';
import Footer from './Footer';

function PrivateRoute() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Render the protected route with layout components
  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-container">
        <SideMenu />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default PrivateRoute;