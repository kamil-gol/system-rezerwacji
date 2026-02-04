import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  changePassword: (currentPassword: string, newPassword: string) => 
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

export const reservationsAPI = {
  getAll: (params?: any) => api.get('/reservations', { params }),
  getById: (id: string) => api.get(`/reservations/${id}`),
  create: (data: any) => api.post('/reservations', data),
  update: (id: string, data: any) => api.put(`/reservations/${id}`, data),
  cancel: (id: string, reason: string) => api.delete(`/reservations/${id}`, { data: { reason } }),
  getUpcoming: (days?: number) => api.get('/reservations/upcoming', { params: { days } }),
  getArchived: (params?: any) => api.get('/reservations/archive', { params }),
  getHistory: (id: string) => api.get(`/reservations/${id}/history`),
  generatePDF: (id: string) => api.get(`/reservations/${id}/pdf`, { responseType: 'blob' }),
  sendEmail: (id: string) => api.post(`/reservations/${id}/send-email`),
  uploadAttachments: (id: string, files: FormData) => 
    api.post(`/reservations/${id}/attachments`, files, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const customersAPI = {
  getAll: (params?: any) => api.get('/customers', { params }),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  getReservations: (id: string) => api.get(`/customers/${id}/reservations`),
};

export const roomsAPI = {
  getAll: () => api.get('/rooms'),
  getById: (id: string) => api.get(`/rooms/${id}`),
  checkAvailability: (id: string, date: string) => 
    api.get(`/rooms/${id}/availability`, { params: { date } }),
  create: (data: any) => api.post('/rooms', data),
  update: (id: string, data: any) => api.put(`/rooms/${id}`, data),
};

export const statisticsAPI = {
  getOverview: () => api.get('/statistics/overview'),
  getRevenue: (params?: any) => api.get('/statistics/revenue', { params }),
  getPopularEvents: (limit?: number) => api.get('/statistics/popular-events', { params: { limit } }),
  getRoomUtilization: (startDate?: string, endDate?: string) => 
    api.get('/statistics/room-utilization', { params: { startDate, endDate } }),
  getCustomerStats: () => api.get('/statistics/customer-stats'),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  createUser: (data: any) => api.post('/admin/users', data),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getLogs: (params?: any) => api.get('/admin/logs', { params }),
};

export const backupAPI = {
  create: () => api.post('/backup/create'),
  list: () => api.get('/backup/list'),
  restore: (id: string) => api.post(`/backup/restore/${id}`),
};

export default api;
