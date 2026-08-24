import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import ProtectedRoute from './ProtectedRoute.jsx';

/**
 * Note: this guard is UX only, to route consumers away from admin pages
 * before a network round-trip. The backend's requireRole('admin')
 * middleware is the real authorization boundary — the API rejects
 * non-admin calls with 403 regardless of what the frontend renders.
 */
export default function AdminRoute({ children }) {
  const { isAdmin } = useAuth();

  return (
    <ProtectedRoute>
      {isAdmin ? children : <Navigate to="/forbidden" replace />}
    </ProtectedRoute>
  );
}
