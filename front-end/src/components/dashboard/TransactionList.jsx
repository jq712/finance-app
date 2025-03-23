import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../services/api';
import TransactionFilters from '../transactions/TransactionFilters';
import '../../styles/Transactions.css';

function TransactionsList({ 
  transactions: initialTransactions = null,
  showFilters = true,
  showPagination = true,
  showHousehold = false
}) {
  const [transactions, setTransactions] = useState(initialTransactions || []);
  const [isLoading, setIsLoading] = useState(initialTransactions === null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    household_id: '',
    start_date: '',
    end_date: '',
    category: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Fetch transactions from API if not provided
  useEffect(() => {
    if (initialTransactions === null) {
      fetchTransactions();
    }
  }, [initialTransactions, filters, currentPage]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query params
      const params = { ...filters, page: currentPage, limit: pageSize };
      
      // Remove empty values
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      
      const response = await api.get('/api/transactions', { params });
      
      setTransactions(response.data.transactions || response.data || []);
      
      // Set pagination info if available
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.total_pages);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="transactions-loading">
        <div className="loading-spinner"></div>
        <p>Loading transactions...</p>
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

  if (transactions.length === 0) {
    return (
      <div className="transactions-empty">
        <p>No transactions found.</p>
        <Link to="/transactions/new" className="btn btn-primary">
          Add Transaction
        </Link>
      </div>
    );
  }

  return (
    <div className="transactions-list">
      {showFilters && (
        <TransactionFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
      )}
      
      <div className="transactions-table-container">
        <table className="table transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              {showHousehold && <th>Household</th>}
              <th>Category</th>
              <th className="amount-column">Amount</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{format(new Date(transaction.date), 'MMM dd, yyyy')}</td>
                <td className="description-column">{transaction.description}</td>
                {showHousehold && (
                  <td>{transaction.household_name || 'Personal'}</td>
                )}
                <td>
                  {transaction.category ? (
                    <span className="category-tag">{transaction.category}</span>
                  ) : (
                    <span className="category-tag category-uncategorized">Uncategorized</span>
                  )}
                </td>
                <td className={`amount-column ${transaction.amount < 0 ? 'amount-negative' : 'amount-positive'}`}>
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="actions-column">
                  <Link to={`/transactions/${transaction.id}/edit`} className="btn-icon">
                    <span className="icon">✏️</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {showPagination && totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-secondary btn-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            className="btn btn-secondary btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default TransactionsList;