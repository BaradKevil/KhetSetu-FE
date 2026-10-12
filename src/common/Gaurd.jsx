import { Navigate } from 'react-router-dom';

export const getStoredRole = () => {
  const role = localStorage.getItem('role');
  if (
    role &&
    typeof role === 'string' &&
    role !== '[object Object]' &&
    role !== 'undefined' &&
    role !== 'null' &&
    role.trim() !== ''
  ) {
    return role.trim();
  }

  // Fallback: extract role_code directly from JWT accessToken payload
  const token = localStorage.getItem('accessToken');
  if (token && typeof token === 'string') {
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(atob(parts[1]));
        const code = payload.role_code || payload.role;
        if (code && typeof code === 'string') {
          localStorage.setItem('role', code);
          return code;
        }
      }
    } catch {
      // Ignore token parse failure
    }
  }

  return 'buyer';
};

export const LogGaurd = ({ children }) => {
  const auth = localStorage.getItem('accessToken');
  const role = getStoredRole();

  let defaultPath = '/seller';
  if (role === 'super_admin' || role === 'staff') defaultPath = '/admin';
  if (role === 'buyer') defaultPath = '/buyer';
  if (role === 'seller' || role === 'farmer') defaultPath = '/seller';

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
  const userRole = getStoredRole();
  const isAllowed =
    !allowedRoles ||
    allowedRoles.includes(userRole) ||
    (allowedRoles.includes('seller') && (userRole === 'farmer' || userRole === 'seller')) ||
    (allowedRoles.includes('farmer') && (userRole === 'seller' || userRole === 'farmer')) ||
    userRole === 'super_admin';

  if (isAllowed) {
    return children;
  }
  return <Navigate to="/not-authorized" replace />;
};

export const HomeRedirect = () => {
  const auth = localStorage.getItem('accessToken');
  const userRole = getStoredRole();

  if (!auth) {
    return <Navigate to="/" replace />;
  }

  if (userRole === 'super_admin' || userRole === 'staff') {
    return <Navigate to="/admin" replace />;
  }
  if (userRole === 'seller' || userRole === 'farmer') {
    return <Navigate to="/seller" replace />;
  }
  if (userRole === 'buyer') {
    return <Navigate to="/buyer" replace />;
  }
  return <Navigate to="/" replace />;
};
