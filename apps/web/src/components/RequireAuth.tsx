import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../lib/db';

export function RequireAuth({ children, staffOnly = false, adminOnly = false }: { children: ReactNode; staffOnly?: boolean; adminOnly?: boolean }) {
  const { user, isStaff, isAdmin } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (adminOnly && !isAdmin) return <Navigate to="/admin" replace />;
  if (staffOnly && !isStaff) return <Navigate to="/account" replace />;
  return <>{children}</>;
}
