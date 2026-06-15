import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function GuestOnlyRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  }
  return children;
}
