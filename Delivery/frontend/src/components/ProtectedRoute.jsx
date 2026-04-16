import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleDashboardMap = {
  customer: '/customer/dashboard',
  vendor: '/vendor/dashboard',
  delivery_partner: '/delivery/dashboard',
  admin: '/admin/dashboard',
};

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    const redirectPath = roleDashboardMap[user.role] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
