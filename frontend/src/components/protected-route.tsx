import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/auth-context";

interface ProtectedRouteProps {
  requireAdmin?: boolean;
  children?: React.ReactNode;
}

export function ProtectedRoute({ requireAdmin = false, children }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/directory" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
