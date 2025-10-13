import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me')
};

// Players API
export const playersApi = {
  getAll: (params?: { position?: string; team?: string; sort?: string }) =>
    api.get('/players', { params }),
  getOne: (id: string) => api.get(`/players/${id}`),
  search: (query: string) => api.get('/players/search', { params: { q: query } }),
  getMarketStats: () => api.get('/players/market-stats')
};

// Portfolio API
export const portfolioApi = {
  get: () => api.get('/portfolio'),
  buy: (data: { playerId: string; quantity: number }) =>
    api.post('/portfolio/buy', data),
  sell: (data: { playerId: string; quantity: number }) =>
    api.post('/portfolio/sell', data),
  getTransactions: (limit?: number) =>
    api.get('/portfolio/transactions', { params: { limit } })
};

// Leaderboard API
export const leaderboardApi = {
  get: (limit?: number) => api.get('/leaderboard', { params: { limit } }),
  getUserRank: (userId: string) => api.get(`/leaderboard/rank/${userId}`)
};

// Admin API
export const adminApi = {
  createPlayer: (data: {
    name: string;
    team: string;
    position: string;
    price: number;
    imageUrl?: string;
  }) => api.post('/admin/players', data),
  updatePlayer: (playerId: string, data: any) =>
    api.put(`/admin/players/${playerId}`, data),
  deletePlayer: (playerId: string) => api.delete(`/admin/players/${playerId}`),
  updatePlayerStats: (playerId: string, data: {
    matchweek: number;
    goals?: number;
    assists?: number;
    cleanSheet?: boolean;
    yellowCards?: number;
    redCards?: number;
    minutesPlayed?: number;
    rating?: number;
  }) => api.post(`/admin/players/${playerId}/stats`, data),
  createMatchweek: (data: {
    weekNumber: number;
    startDate: string;
    endDate: string;
  }) => api.post('/admin/matchweeks', data),
  getActiveMatchweek: () => api.get('/admin/matchweeks/active'),
  completeMatchweek: (weekNumber: number) =>
    api.post(`/admin/matchweeks/${weekNumber}/complete`)
};

export default api;
