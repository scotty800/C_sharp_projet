import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ 
  children, 
  requireVendor = false, 
  requireAdmin = false 
}) => {
  const { isAuthenticated, isVendor, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireVendor && !isVendor) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;