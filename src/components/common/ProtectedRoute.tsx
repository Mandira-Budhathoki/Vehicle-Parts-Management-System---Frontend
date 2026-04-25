import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type Role } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    // If user is authenticated but doesn't have the right role, redirect to their role-specific dashboard or unauthorized page
    switch (role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'staff':
        return <Navigate to="/staff/dashboard" replace />;
      case 'customer':
        return <Navigate to="/customer/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};
