import { Navigate, useLocation } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { RoleProvider } from "../providers/RoleProvider";
import { useAuth } from "../../hooks/useAuth";
import { AppLayout } from "../../components/layout/AppLayout";

export function ProtectedLayout() {
  const { isInitializing, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <RoleProvider roles={user.roles} defaultRole={user.roles[0]}>
      <AppLayout />
    </RoleProvider>
  );
}
