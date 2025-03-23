import api from './api';

const householdsService = {
  // Get all households
  getHouseholds: async () => {
    const response = await api.get('/api/households');
    return response.data;
  },
  
  // Get a single household by ID
  getHousehold: async (id) => {
    const response = await api.get(`/api/households/${id}`);
    return response.data;
  },
  
  // Create a new household
  createHousehold: async (name) => {
    const response = await api.post('/api/households', { name });
    return response.data;
  },
  
  // Get members of a household
  getHouseholdMembers: async (id) => {
    const response = await api.get(`/api/households/${id}/members`);
    return response.data;
  },
  
  // Create an invite code for a household
  createInvite: async (householdId, expiresInDays = 7) => {
    const response = await api.post(`/api/households/${householdId}/invites`, {
      expires_in_days: expiresInDays
    });
    return response.data;
  },
  
  // Get active invites for a household
  getInvites: async (householdId) => {
    const response = await api.get(`/api/households/${householdId}/invites`);
    return response.data;
  },
  
  // Join a household using an invite code
  joinHousehold: async (inviteCode) => {
    const response = await api.post(`/api/households/join/${inviteCode}`);
    return response.data;
  }
};

export default householdsService;