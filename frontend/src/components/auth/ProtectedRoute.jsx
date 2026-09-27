/**
 * Nearza — Protected Route Guard
 * Enforces client-side route access control based on authentication state and user roles.
 * Note: Backend APIs independently enforce permissions on every request.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLoading } from './AuthLoading';

export function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/login',
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Show authentication loading state while checking session
  if (loading) {
    return <AuthLoading message="Verifying security credentials..." />;
  }

  // 2. Redirect to login if user is not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // 3. Role-based permission check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
