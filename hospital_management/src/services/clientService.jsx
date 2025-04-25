import api from './api';

// Get all clients with pagination
export const getClients = async (page = 1, limit = 10, searchQuery = '') => {
  const params = { page, limit };
  if (searchQuery) params.search = searchQuery;
  
  const response = await api.get('/clients', { params });
  return response.data;
};

// Get single client by ID
export const getClient = async (id) => {
  const response = await api.get(`/clients/${id}`);
  return response.data;
};

// Create new client
export const createClient = async (clientData) => {
  const response = await api.post('/clients', clientData);
  return response.data;
};

// Update client
export const updateClient = async (id, clientData) => {
  const response = await api.put(`/clients/${id}`, clientData);
  return response.data;
};

// Delete client
export const deleteClient = async (id) => {
  const response = await api.delete(`/clients/${id}`);
  return response.data;
};

// Search clients by name or other criteria
export const searchClients = async (query) => {
  const response = await api.get(`/clients/search?query=${query}`);
  return response.data;
};

// Enroll client in a program
export const enrollClientInProgram = async (clientId, programData) => {
  const response = await api.post(`/clients/${clientId}/programs`, programData);
  return response.data;
};

// Remove client from a program
export const removeClientFromProgram = async (clientId, programId) => {
  const response = await api.delete(`/clients/${clientId}/programs/${programId}`);
  return response.data;
};

// Update client's program enrollment status
export const updateEnrollmentStatus = async (clientId, programId, statusData) => {
  const response = await api.put(`/clients/${clientId}/programs/${programId}`, statusData);
  return response.data;
};