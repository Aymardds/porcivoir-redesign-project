import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: Array<'customer' | 'admin' | 'editor' | 'stock_manager' | 'seo'>;
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

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

  // Not authorized (wrong role)
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  // Authorized
  return <Outlet />;
};

export default ProtectedRoute;
