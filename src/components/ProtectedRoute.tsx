import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Not authorized — user must have at least one of the allowed roles
  if (allowedRoles && profile && !hasRole(...allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  // Authorized
  return <Outlet />;
};

export default ProtectedRoute;
