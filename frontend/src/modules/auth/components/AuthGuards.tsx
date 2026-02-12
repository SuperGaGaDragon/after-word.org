import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthSession } from '../session/AuthSessionContext';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuthSession();
  const location = useLocation();

  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/auth/login?return=${returnTo}`} replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuthSession();

  if (isAuthenticated) {
    return <Navigate to="/works" replace />;
  }

  return <Outlet />;
}
