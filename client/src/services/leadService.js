import api from './api';

export const leadService = {
  // Fetch leads with search, filters, pagination, and sorting
  getLeads: async (params = {}) => {
    const response = await api.get('/leads', { params });
    return response.data;
  },

  // Fetch individual lead by ID
  getLeadById: async (id) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  // Create a new lead
  createLead: async (leadData) => {
    const response = await api.post('/leads', leadData);
    return response.data;
  },

  // Update existing lead
  updateLead: async (id, leadData) => {
    const response = await api.put(`/leads/${id}`, leadData);
    return response.data;
  },

  // Delete lead
  deleteLead: async (id) => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },

  // Fetch dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};
