import api from './api';

const transactionsService = {
  // Get all transactions with optional filtering
  getTransactions: async (filters = {}) => {
    // Convert filters to query params
    const params = new URLSearchParams();
    
    if (filters.household_id) {
      params.append('household_id', filters.household_id);
    }
    
    if (filters.start_date) {
      params.append('start_date', filters.start_date);
    }
    
    if (filters.end_date) {
      params.append('end_date', filters.end_date);
    }
    
    if (filters.category) {
      params.append('category', filters.category);
    }
    
    const response = await api.get(`/api/transactions?${params.toString()}`);
    return response.data;
  },
  
  // Get a single transaction by ID
  getTransaction: async (id) => {
    const response = await api.get(`/api/transactions/${id}`);
    return response.data;
  },
  
  // Create a new transaction
  createTransaction: async (transactionData) => {
    const response = await api.post('/api/transactions', transactionData);
    return response.data;
  },
  
  // Update an existing transaction
  updateTransaction: async (id, transactionData) => {
    const response = await api.put(`/api/transactions/${id}`, transactionData);
    return response.data;
  },
  
  // Delete a transaction
  deleteTransaction: async (id) => {
    const response = await api.delete(`/api/transactions/${id}`);
    return response.data;
  },
  
  // Get transaction summary
  getSummary: async (params = {}) => {
    const response = await api.get('/api/transactions/summary', { params });
    return response.data;
  },
  
  // Get available categories
  getCategories: async () => {
    const response = await api.get('/api/transactions/categories');
    return response.data;
  }
};

export default transactionsService;