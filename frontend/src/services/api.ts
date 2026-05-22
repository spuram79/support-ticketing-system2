import { API_URL } from '../constants/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  tickets: {
    getAll: (params?: any) => fetch(`${API_URL}/api/v1/tickets?${new URLSearchParams(params || {})}`, { headers: getHeaders() }),
    getById: (id: string) => fetch(`${API_URL}/api/v1/tickets/${id}`, { headers: getHeaders() }),
    create: (data: any) => fetch(`${API_URL}/api/v1/tickets`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetch(`${API_URL}/api/v1/tickets/${id}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data) }),
    delete: (id: string) => fetch(`${API_URL}/api/v1/tickets/${id}`, { method: 'DELETE', headers: getHeaders() }),
    getStats: () => fetch(`${API_URL}/api/v1/tickets/stats`, { headers: getHeaders() }),
  },
  auth: {
    login: (data: any) => fetch(`${API_URL}/api/v1/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }),
    register: (data: any) => fetch(`${API_URL}/api/v1/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }),
    getProfile: () => fetch(`${API_URL}/api/v1/auth/me`, { headers: getHeaders() }),
    updateProfile: (data: any) => fetch(`${API_URL}/api/v1/auth/me`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data) }),
  },
  users: {
    getAll: (params?: any) => fetch(`${API_URL}/api/v1/users?${new URLSearchParams(params || {})}`, { headers: getHeaders() }),
    update: (id: string, data: any) => fetch(`${API_URL}/api/v1/users/${id}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data) }),
  },
  channels: {
    getAll: () => fetch(`${API_URL}/api/v1/channels`, { headers: getHeaders() }),
  },
};