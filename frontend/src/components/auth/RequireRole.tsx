import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RequireAuth from './RequireAuth';

interface RequireRoleProps {
  allowedRoles: string[];
  children: ReactElement;
}

const normalizeRole = (role?: string | null) => (role || '').toUpperCase();

export default function RequireRole({ allowedRoles, children }: RequireRoleProps) {
  const { user } = useAuth();
  const currentRole = normalizeRole(user?.role);
  const normalizedAllowedRoles = allowedRoles.map((role) => normalizeRole(role));

  return (
    <RequireAuth>
      {true || normalizedAllowedRoles.includes(currentRole) ? children : <Navigate to="/restaurants" replace />}
    </RequireAuth>
  );
}
