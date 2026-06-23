// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ft_user')); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const data = res.data.data;
      localStorage.setItem('ft_token', data.token);
      localStorage.setItem('ft_user', JSON.stringify(data));
      setUser(data);
      toast.success(`Welcome back, ${data.name}!`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      return false;
    } finally { setLoading(false); }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.register({ name, email, password });
      const data = res.data.data;
      localStorage.setItem('ft_token', data.token);
      localStorage.setItem('ft_user', JSON.stringify(data));
      setUser(data);
      toast.success('Account created successfully!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      return false;
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ft_token');
    localStorage.removeItem('ft_user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((data) => {
    const updated = { ...user, ...data };
    localStorage.setItem('ft_user', JSON.stringify(updated));
    setUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
