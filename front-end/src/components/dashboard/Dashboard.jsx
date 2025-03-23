import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import TransactionSummary from './TransactionSummary';
import TransactionList from './TransactionList';
import HouseholdList from './HouseholdList';
import '../../styles/Dashboard.css';

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [households, setHouseholds] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch transaction summary
        const summaryResponse = await api.get('/api/transactions/summary', {
          params: {
            period: 'monthly',
            // Last 6 months
            start_date: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0]
          }
        });
        
        // Fetch recent transactions (5 most recent)
        const transactionsResponse = await api.get('/api/transactions', {
          params: { limit: 5 }
        });
        
        // Fetch households
        const householdsResponse = await api.get('/api/households');
        
        setSummaryData(summaryResponse.data);
        setTransactions(transactionsResponse.data);
        setHouseholds(householdsResponse.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
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

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard</h1>
      
      <div className="dashboard-summary">
        <div className="card">
          <div className="card-header">
            <h2>Transaction Summary</h2>
            <Link to="/transactions" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>
          
          {summaryData && (
            <TransactionSummary summaryData={summaryData} />
          )}
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-recent-transactions">
          <div className="card">
            <div className="card-header">
              <h2>Recent Transactions</h2>
              <Link to="/transactions/new" className="btn btn-primary btn-sm">
                Add New
              </Link>
            </div>
            
            <TransactionList 
              transactions={transactions} 
              showFilters={false}
              showPagination={false}
              showHousehold={true}
            />
          </div>
        </div>
        
        <div className="dashboard-households">
          <div className="card">
            <div className="card-header">
              <h2>My Households</h2>
              <Link to="/households/new" className="btn btn-primary btn-sm">
                Create
              </Link>
            </div>
            
            <HouseholdList 
              households={households} 
              showCreateButton={false} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;