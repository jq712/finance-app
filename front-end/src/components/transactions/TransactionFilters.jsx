import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';

function TransactionFilters({ filters, onFilterChange }) {
  const [households, setHouseholds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [localFilters, setLocalFilters] = useState({
    household_id: filters.household_id || '',
    start_date: filters.start_date || '',
    end_date: filters.end_date || '',
    category: filters.category || ''
  });

  useEffect(() => {
    // Fetch households and categories for filter dropdowns
    const fetchFilterOptions = async () => {
      try {
        // Fetch households
        const householdsResponse = await api.get('/api/households');
        setHouseholds(householdsResponse.data || []);
        
        // Fetch categories (could be from transactions or a dedicated endpoint)
        const categoriesResponse = await api.get('/api/transactions/categories');
        setCategories(categoriesResponse.data || []);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    
    fetchFilterOptions();
  }, []);

  // Keep local filters in sync with parent component
  useEffect(() => {
    setLocalFilters({
      household_id: filters.household_id || '',
      start_date: filters.start_date || '',
      end_date: filters.end_date || '',
      category: filters.category || ''
    });
  }, [filters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({ ...localFilters, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      household_id: '',
      start_date: '',
      end_date: '',
      category: ''
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="transaction-filters">
      <form onSubmit={handleSubmit} className="filters-form">
        <div className="form-group">
          <label htmlFor="household_id">Household</label>
          <select
            id="household_id"
            name="household_id"
            value={localFilters.household_id}
            onChange={handleInputChange}
          >
            <option value="">All Households</option>
            <option value="personal">Personal Only</option>
            {households.map(household => (
              <option key={household.id} value={household.id}>
                {household.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="start_date">From Date</label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={localFilters.start_date}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="end_date">To Date</label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={localFilters.end_date}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={localFilters.category}
            onChange={handleInputChange}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filters-actions">
          <button type="button" onClick={handleReset} className="btn btn-secondary">
            Reset
          </button>
          <button type="submit" className="btn btn-primary">
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
}

export default TransactionFilters;