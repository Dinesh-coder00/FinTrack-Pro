// src/services/api.js
// Central Axios instance – attaches JWT, handles 401 globally.

import axios from 'axios';

const API = axios.create({
 baseURL: "https://fintrack-pro-1-7v28.onrender.com/api",        // proxied to Spring Boot :8080/api
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor – inject Bearer token ──────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ft_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

// ── Response interceptor – unwrap .data.data, handle 401 ──────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ft_token');
      localStorage.removeItem('ft_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data) => API.post('/auth/register', data),
  login:          (data) => API.post('/auth/login', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  verifyOtp:      (data) => API.post('/auth/verify-otp', data),
  resetPassword:  (data) => API.post('/auth/reset-password', data),
};

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  get: () => API.get('/dashboard'),
};

// ─────────────────────────────────────────────────────────────────────────────
// Income
// ─────────────────────────────────────────────────────────────────────────────
export const incomeAPI = {
  getAll:  (params) => API.get('/income', { params }),
  create:  (data)   => API.post('/income', data),
  update:  (id, data) => API.put(`/income/${id}`, data),
  remove:  (id)     => API.delete(`/income/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Expense
// ─────────────────────────────────────────────────────────────────────────────
export const expenseAPI = {
  getAll:  (params) => API.get('/expense', { params }),
  create:  (data)   => API.post('/expense', data),
  update:  (id, data) => API.put(`/expense/${id}`, data),
  remove:  (id)     => API.delete(`/expense/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Budget
// ─────────────────────────────────────────────────────────────────────────────
export const budgetAPI = {
  getAll: ()     => API.get('/budget'),
  upsert: (data) => API.post('/budget', data),
};

// ─────────────────────────────────────────────────────────────────────────────
// Savings Goals
// ─────────────────────────────────────────────────────────────────────────────
export const savingsAPI = {
  getAll:     ()          => API.get('/savings'),
  create:     (data)      => API.post('/savings', data),
  contribute: (id, amount)=> API.patch(`/savings/${id}/contribute?amount=${amount}`),
  remove:     (id)        => API.delete(`/savings/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// Analytics
// ─────────────────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  get: () => API.get('/analytics'),
};

// ─────────────────────────────────────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────────────────────────────────────
export const profileAPI = {
  get:    ()     => API.get('/profile'),
  update: (data) => API.patch('/profile', data),
};

export default API;
