import React from 'react';
import { useResolvedPermissions, hasPermission } from '../../../hooks/usePermissions';

export function AdminRolesPage() {
  const { permissions, loading: permLoading } = useResolvedPermissions();
  const REQUIRED_PERMISSION = 'ADMIN_ROLES';
  if (permLoading) return <div>Loading permissions...</div>;
  if (!hasPermission(permissions, REQUIRED_PERMISSION)) {
    return <div className="alert alert-danger mt-4">You do not have permission to view admin roles.</div>;
  }
  return (
    <div className="container py-3">
      <h2 className="mb-3">Admin - Roles</h2>
      <p className="text-muted mb-4">Placeholder page. Future: list roles, create new role, display assigned users count.</p>
      <div className="alert alert-info">Implementation pending: integrate with /admin/roles endpoints.</div>
    </div>
  );
}
