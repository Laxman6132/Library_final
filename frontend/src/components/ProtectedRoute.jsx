import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { auth } = useAuth();

  if (!auth) return <Navigate to="/login" replace />;

  // Normalize stored role — DB may have 'Admin', 'admin', 'ROLE_ADMIN', etc.
  const role = (auth.role || '').toUpperCase().replace(/^ROLE_/, '');
  const isAdmin     = role === 'ADMIN';
  const isLibrarian = role === 'LIBRARIAN' || role === 'ADMIN';

  if (requiredRole === 'ADMIN' && !isAdmin) {
    return <Navigate to={isLibrarian ? '/librarian' : '/dashboard'} replace />;
  }

  if (requiredRole === 'LIBRARIAN' && !isLibrarian) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
