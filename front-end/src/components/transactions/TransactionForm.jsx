import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { format } from 'date-fns';

function TransactionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    category: '',
    household_id: ''
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [households, setHouseholds] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Fetch data needed for the form
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        // Fetch households for dropdown
        const householdsResponse = await api.get('/api/households');
        setHouseholds(householdsResponse.data || []);
        
        // Fetch common categories for dropdown
        const categoriesResponse = await api.get('/api/transactions/categories');
        setCategories(categoriesResponse.data || []);
        
        // If editing, fetch the transaction data
        if (isEditing) {
          const transactionResponse = await api.get(`/api/transactions/${id}`);
          const transaction = transactionResponse.data;
          
          setFormData({
            amount: transaction.amount.toString(),
            date: format(new Date(transaction.date), 'yyyy-MM-dd'),
            description: transaction.description,
            category: transaction.category || '',
            household_id: transaction.household_id ? transaction.household_id.toString() : ''
          });
        }
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFormData();
  }, [id, isEditing]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare data for API
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        household_id: formData.household_id || null,
      };
      
      // Create or update the transaction
      if (isEditing) {
        await api.put(`/api/transactions/${id}`, submitData);
      } else {
        await api.post('/api/transactions', submitData);
      }
      
      // Redirect to transactions list
      navigate('/transactions');
    } catch (err) {
      console.error('Error submitting transaction:', err);
      setError(err.message || 'Failed to save transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading transaction data...</p>
      </div>
    );
  }
  
  return (
    <div className="transaction-form-container">
      <div className="form-header">
        <h2>{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</h2>
        <p>
          {isEditing 
            ? 'Update the transaction details below.'
            : 'Enter the details for your new transaction.'}
        </p>
      </div>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="card transaction-form">
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <div className="amount-input">
            <span className="currency-symbol">$</span>
            <input
              type="number"
              id="amount"
              name="amount"
              step="0.01"
              required
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.00"
            />
          </div>
          <p className="form-help">
            Use positive values for income and negative for expenses (e.g., -20.00)
          </p>
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            required
            value={formData.date}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            required
            value={formData.description}
            onChange={handleInputChange}
            placeholder="e.g., Grocery shopping"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <div className="category-input">
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="">Select Category (optional)</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="household_id">Household</label>
          <select
            id="household_id"
            name="household_id"
            value={formData.household_id}
            onChange={handleInputChange}
          >
            <option value="">Personal (not shared)</option>
            {households.map(household => (
              <option key={household.id} value={household.id}>
                {household.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-footer">
          <Link to="/transactions" className="btn btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;