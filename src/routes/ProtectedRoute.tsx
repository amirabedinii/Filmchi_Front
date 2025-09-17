import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth.ts'; // Assuming auth store

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" />;
};


