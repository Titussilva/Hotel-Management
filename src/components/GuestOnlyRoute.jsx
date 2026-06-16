import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function GuestOnlyRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Wait for session restore to complete before deciding to redirect or render.
  // Without this, isAuthenticated is briefly false during token verification
  // even when a valid session exists in localStorage, causing the guest page
  // to flash through for authenticated users.
  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }
  return children;
}
