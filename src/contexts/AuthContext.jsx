import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('stayease-session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const saved = localStorage.getItem('stayease-session');
      if (!saved) {
        setLoading(false);
        return;
      }
      try {
        const { token } = JSON.parse(saved);
        if (token && token !== 'demo-token' && token !== 'demo-admin-token') {
          const user = await authAPI.me();
          setSession({ token, user });
        }
      } catch (err) {
        console.error('Session restore failed:', err);
        localStorage.removeItem('stayease-session');
        setSession(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      // Try real API first
      const data = await authAPI.login({ email, password });
      const sess = { token: data.token, user: data.user };
      localStorage.setItem('stayease-session', JSON.stringify(sess));
      setSession(sess);
      return sess;
    } catch (error) {
      // Demo mode fallback
      if (email === 'guest@stayease.test' && password === 'password123') {
        const demoSess = {
          token: 'demo-token',
          user: { id: 'demo-user', name: 'Ava Stone', email, role: 'guest' },
        };
        localStorage.setItem('stayease-session', JSON.stringify(demoSess));
        setSession(demoSess);
        return demoSess;
      }
      if (email === 'admin@stayease.test' && password === 'password123') {
        const adminDemoSess = {
          token: 'demo-admin-token',
          user: { id: 'demo-admin', name: 'Morgan Admin', email, role: 'admin' },
        };
        localStorage.setItem('stayease-session', JSON.stringify(adminDemoSess));
        setSession(adminDemoSess);
        return adminDemoSess;
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setLoading(true);
    try {
      const data = await authAPI.register(formData);
      const sess = { token: data.token, user: data.user };
      localStorage.setItem('stayease-session', JSON.stringify(sess));
      setSession(sess);
      return sess;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('stayease-session');
    setSession(null);
  }, []);

  const updateSession = useCallback((updates) => {
    setSession((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('stayease-session', JSON.stringify(next));
      return next;
    });
  }, []);

  const isDemo = session?.token === 'demo-token' || session?.token === 'demo-admin-token';
  const isAdmin = session?.user?.role === 'admin';
  const isAuthenticated = !!session?.token;

  return (
    <AuthContext.Provider value={{ session, loading, login, register, logout, updateSession, isDemo, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
