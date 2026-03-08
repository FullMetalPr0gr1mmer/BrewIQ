import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuthStore();

  if (loading) return <LoadingSpinner className="h-screen" size="lg" />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
