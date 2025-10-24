/**
 * Offline Protected Route Component
 * Protects routes when working offline based on cached permissions
 */

import React, { ReactNode } from 'react';
import { Alert, Card, Button } from 'react-bootstrap';
import { offlinePermissionService } from '../../services/offlinePermissionService';
import { useAuth } from '../../hooks/useAuth';

interface OfflineProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean; // If true, requires ALL permissions; if false, requires ANY permission
  fallback?: ReactNode;
  showPermissionStatus?: boolean;
}

export const OfflineProtectedRoute: React.FC<OfflineProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  fallback,
  showPermissionStatus = true
}) => {
  const { isAuthenticated, user } = useAuth();
  const isOnline = navigator.onLine;

  // If not authenticated, show login prompt
  if (!isAuthenticated || !user) {
    return (
      <Card className="m-3">
        <Card.Body className="text-center">
          <Alert variant="warning">
            <Alert.Heading>Authentication Required</Alert.Heading>
            <p>You must be logged in to access this feature.</p>
            <Button variant="primary" href="/login">
              Go to Login
            </Button>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  // If online, let the normal permission system handle it
  if (isOnline) {
    return <>{children}</>;
  }

  // Check offline permissions
  let hasPermission = true;
  let permissionError = '';

  if (requiredPermission) {
    hasPermission = offlinePermissionService.hasPermission(requiredPermission);
    if (!hasPermission) {
      permissionError = `You don't have permission to access this feature offline. Required: ${requiredPermission}`;
    }
  }

  if (requiredPermissions && hasPermission) {
    if (requireAll) {
      hasPermission = offlinePermissionService.hasAllPermissions(requiredPermissions);
      if (!hasPermission) {
        permissionError = `You don't have all required permissions offline. Required: ${requiredPermissions.join(', ')}`;
      }
    } else {
      hasPermission = offlinePermissionService.hasAnyPermission(requiredPermissions);
      if (!hasPermission) {
        permissionError = `You don't have any of the required permissions offline. Required: ${requiredPermissions.join(', ')}`;
      }
    }
  }

  // Check session validity
  if (hasPermission && !offlinePermissionService.isSessionValid()) {
    hasPermission = false;
    permissionError = 'Your session has expired. Please go online to refresh your session.';
  }

  // If no permission, show access denied
  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="m-3">
        <Card.Body>
          <Alert variant="danger">
            <Alert.Heading>Access Denied</Alert.Heading>
            <p>{permissionError}</p>
            <div className="mt-3">
              <Button 
                variant="outline-primary" 
                onClick={() => window.location.reload()}
                className="me-2"
              >
                Refresh Page
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  // Show permission status if requested
  const permissionStatus = showPermissionStatus ? (
    <Alert variant="info" className="mb-3">
      <Alert.Heading>Working Offline</Alert.Heading>
      <p>Your permissions are based on your last online session.</p>
      <small className="text-muted">
        Active Role: {offlinePermissionService.getActiveRole() || 'Unknown'} | 
        Session Valid: {offlinePermissionService.isSessionValid() ? 'Yes' : 'No'}
      </small>
    </Alert>
  ) : null;

  return (
    <>
      {permissionStatus}
      {children}
    </>
  );
};

/**
 * Hook for checking offline permissions
 */
export const useOfflinePermissions = () => {
  const isOnline = navigator.onLine;
  
  return {
    isOnline,
    hasPermission: (permission: string) => offlinePermissionService.hasPermission(permission),
    hasAnyPermission: (permissions: string[]) => offlinePermissionService.hasAnyPermission(permissions),
    hasAllPermissions: (permissions: string[]) => offlinePermissionService.hasAllPermissions(permissions),
    canPerformAction: (action: string, resourceType: string, resourceId?: number) => 
      offlinePermissionService.canPerformAction(action, resourceType, resourceId),
    validateUploadPermissions: (dataType: string) => 
      offlinePermissionService.validateUploadPermissions(dataType),
    getActiveRole: () => offlinePermissionService.getActiveRole(),
    getCachedPermissions: () => offlinePermissionService.getCachedPermissions(),
    getPermissionStatus: (permission: string) => 
      offlinePermissionService.getPermissionStatus(permission),
    getDebugInfo: () => offlinePermissionService.getDebugInfo()
  };
};

/**
 * Component for displaying permission status
 */
export const PermissionStatus: React.FC<{ permission: string }> = ({ permission }) => {
  const { getPermissionStatus } = useOfflinePermissions();
  const status = getPermissionStatus(permission);
  
  const getVariant = () => {
    switch (status.status) {
      case 'ALLOWED': return 'success';
      case 'NOT_ALLOWED': return 'danger';
      case 'UNSET': return 'warning';
      default: return 'secondary';
    }
  };
  
  const getText = () => {
    switch (status.status) {
      case 'ALLOWED': return 'Allowed';
      case 'NOT_ALLOWED': return 'Not Allowed';
      case 'UNSET': return 'Not Set';
      default: return 'Unknown';
    }
  };
  
  return (
    <span className={`badge bg-${getVariant()}`}>
      {getText()} {status.cached ? '(Cached)' : ''}
    </span>
  );
};

/**
 * Component for offline permission warnings
 */
export const OfflinePermissionWarning: React.FC = () => {
  const { isOnline, getActiveRole, getCachedPermissions } = useOfflinePermissions();
  
  if (isOnline) {
    return null;
  }
  
  const activeRole = getActiveRole();
  const permissions = getCachedPermissions();
  const permissionCount = Object.keys(permissions).length;
  
  return (
    <Alert variant="info" className="mb-3">
      <Alert.Heading>Working Offline</Alert.Heading>
      <p>Your permissions are based on your last online session.</p>
      <div className="mt-2">
        <small className="text-muted">
          <strong>Active Role:</strong> {activeRole || 'Unknown'} | 
          <strong> Cached Permissions:</strong> {permissionCount} | 
          <strong> Status:</strong> Offline Mode
        </small>
      </div>
      <div className="mt-2">
        <small>
          <strong>Note:</strong> Some features may be restricted until you go back online.
        </small>
      </div>
    </Alert>
  );
};
