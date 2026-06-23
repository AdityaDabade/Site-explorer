import PropTypes from 'prop-types';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from './Loader';
import { useAuth } from '../../context/AuthContext';

/**
 * Protects authenticated routes and forwards unauthenticated users to login.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader label="Checking session..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace to={requiredRole === 'admin' ? '/admin/login' : '/login'} state={{ from: location }} />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate replace to={requiredRole === 'admin' ? '/admin/login' : '/'} state={{ from: location }} />;
  }

  return children || <Outlet />;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  requiredRole: PropTypes.string
};

ProtectedRoute.defaultProps = {
  children: null,
  requiredRole: ''
};
