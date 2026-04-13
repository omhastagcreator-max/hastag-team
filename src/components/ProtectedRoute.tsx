import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type AppRole = 'admin' | 'employee' | 'client' | 'sales';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Roles allowed to view this route. Omit to allow any authenticated user. */
  allow?: AppRole[];
}

/**
 * Single source of truth for the role -> spec dashboard mapping.
 * Spec paths (DEVELOPER_HANDOFF.md):
 *   admin    -> /admin
 *   employee -> /dashboard
 *   sales    -> /sales
 *   client   -> /client
 */
export function dashboardForRole(role: AppRole | null | undefined): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'sales':
      return '/sales';
    case 'client':
      return '/client';
    case 'employee':
      return '/dashboard';
    default:
      return '/login';
  }
}

export function ProtectedRoute({ children, allow }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Not signed in -> bounce to login, remember where they were going.
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Signed in but wrong role -> send them to their own dashboard.
  if (allow && role && !allow.includes(role)) {
    return <Navigate to={dashboardForRole(role)} replace />;
  }

  return <>{children}</>;
}
