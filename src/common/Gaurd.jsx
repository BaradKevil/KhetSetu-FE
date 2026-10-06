import { Navigate } from 'react-router-dom';

export const LogGaurd = ({ children }) => {
  const auth = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role') || 'buyer';

  let defaultPath = '/seller';
  if (role === 'super_admin' || role === 'staff') defaultPath = '/admin';
  if (role === 'buyer') defaultPath = '/buyer';

  if (!auth) {
    return children;
  }
  return <Navigate to={defaultPath} replace />;
};

export const AuthGaurd = ({ children }) => {
  const auth = localStorage.getItem('accessToken');
  if (auth) {
    return children;
  }
  return <Navigate to="/login" replace />;
};

export const RoleGuard = ({ allowedRoles, children }) => {
  const userRole = localStorage.getItem('role') || 'buyer';
  const isAllowed = !allowedRoles || allowedRoles.includes(userRole);

  if (isAllowed) {
    return children;
  }
  return <Navigate to="/not-authorized" replace />;
};

export const HomeRedirect = () => {
  const auth = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('role');

  if (!auth) {
    return <Navigate to="/" replace />;
  }

  if (userRole === 'super_admin' || userRole === 'staff') {
    return <Navigate to="/admin" replace />;
  }
  if (userRole === 'seller') {
    return <Navigate to="/seller" replace />;
  }
  if (userRole === 'buyer') {
    return <Navigate to="/buyer" replace />;
  }
  return <Navigate to="/" replace />;
};
