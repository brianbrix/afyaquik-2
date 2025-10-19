import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRoleRedirects, RoleRedirectUrl } from "../../services/roleRedirectApi";
import { Spinner } from "react-bootstrap";
import { RoleProvider } from "../providers/RoleProvider";
import { useAuth } from "../../hooks/useAuth";
import { AppLayout } from "../../components/layout/AppLayout";
import { SuperAdminLayout } from "../../components/admin/SuperAdminLayout";
import { SuperAdminAuthProvider, useSuperAdminAuth } from "../providers/SuperAdminAuthProvider";

function SuperAdminProtectedContent() {
  const { isInitializing, isAuthenticated, user } = useSuperAdminAuth();
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
    return <Navigate to="/super-admin/login" replace state={{ from: location }} />;
  }
  
  return <SuperAdminLayout />;
}

export function ProtectedLayout() {
  const { isInitializing, isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [roleRedirects, setRoleRedirects] = useState<RoleRedirectUrl[] | null>(null);
  const [checkingRedirect, setCheckingRedirect] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !roleRedirects) {
      setCheckingRedirect(true);
      fetchRoleRedirects().then(setRoleRedirects).finally(() => setCheckingRedirect(false));
    }
  }, [isAuthenticated, user, roleRedirects]);

  // Check for super-admin authentication
  const superAdminToken = localStorage.getItem('superAdminAccessToken');
  const superAdminUserStr = localStorage.getItem('superAdminUser');
  const isSuperAdminAuthenticated = superAdminToken && superAdminUserStr;

  if (isInitializing || checkingRedirect) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Handle super-admin authentication
  if (isSuperAdminAuthenticated) {
    // Super-admin users should only access /super-admin routes
    if (!location.pathname.startsWith('/super-admin')) {
      return <Navigate to="/super-admin" replace />;
    }
    
    return (
      <SuperAdminAuthProvider>
        <SuperAdminProtectedContent />
      </SuperAdminAuthProvider>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If user has ONLY the admin role, restrict to /admin URLs only
  const roleKeys = user?.roles?.map((r: any) => typeof r === 'string' ? r : r.roleKey) || [];
  const isAdminOnly = roleKeys.length === 1 && (roleKeys[0] === 'ADMIN' || roleKeys[0] === 'ROLE_ADMIN');
  if (isAdminOnly && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <RoleProvider roles={user?.roles} defaultRole={user?.roles?.[0]} isAuthenticated={isAuthenticated}>
      <AppLayout />
    </RoleProvider>
  );
}
