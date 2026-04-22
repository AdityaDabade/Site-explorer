import PropTypes from 'prop-types';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from './Loader';
import { useAuth } from '../../context/AuthContext';

/**
 * Protects authenticated routes and forwards unauthenticated users to login.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader label="Checking session..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" state={{ from: location }} />;
  }

  return children || <Outlet />;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node
};

ProtectedRoute.defaultProps = {
  children: null
};
