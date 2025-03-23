import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';

// Layout components
import PrivateRoute from './components/layout/PrivateRoute.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';

// Auth components
import Login from './components/auth/Login.jsx';
import Profile from './components/auth/Profile.jsx';

// Dashboard components
import Dashboard from './components/dashboard/Dashboard.jsx';

// Transaction components
import TransactionForm from './components/transactions/TransactionForm.jsx';
import TransactionList from './components/dashboard/TransactionList.jsx';

// Household components
import HouseholdForm from './components/households/HouseholdForm.jsx';
import HouseholdList from './components/dashboard/HouseholdList.jsx';
import HouseholdMembers from './components/dashboard/HouseholdMembers.jsx';
import InviteForm from './components/households/InviteForm.jsx';

function App() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
      } />
      
      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Transaction routes */}
        <Route path="/transactions" element={<TransactionList />} />
        <Route path="/transactions/new" element={<TransactionForm />} />
        <Route path="/transactions/:id/edit" element={<TransactionForm />} />
        
        {/* Household routes */}
        <Route path="/households" element={<HouseholdList />} />
        <Route path="/households/new" element={<HouseholdForm />} />
        <Route path="/households/:id" element={<HouseholdMembers />} />
        <Route path="/households/:id/invite" element={<InviteForm />} />
      </Route>
      
      {/* Redirect to dashboard or login */}
      <Route path="*" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
      } />
    </Routes>
  );
}

export default App;