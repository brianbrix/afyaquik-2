import React from 'react';
import { useResolvedPermissions, hasPermission } from '../../../hooks/usePermissions';

export function AdminUsersPage() {
  const { permissions, loading: permLoading } = useResolvedPermissions();
  const REQUIRED_PERMISSION = 'ADMIN_USERS';
  if (permLoading) return <div>Loading permissions...</div>;
  if (!hasPermission(permissions, REQUIRED_PERMISSION)) {
    return <div className="alert alert-danger mt-4">You do not have permission to view admin users.</div>;
  }
  return (
    <div className="container py-3">
      <h2 className="mb-3">Admin - Users</h2>
      <p className="text-muted mb-4">Placeholder page. Future: searchable user directory, create/edit modal, role assignment matrix.</p>
      <div className="alert alert-info">Implementation pending: integrate with /admin/users endpoints.</div>
    </div>
  );
}
