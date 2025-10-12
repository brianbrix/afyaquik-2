import React from 'react';
import { useResolvedPermissions, hasPermission } from '../../../hooks/usePermissions';
import UserGroupAdminPage from '../user-groups/UserGroupAdminPage';

export function AdminUserGroupsPage() {
  const { permissions, loading: permLoading } = useResolvedPermissions();
  const REQUIRED_PERMISSION = 'MANAGE_GROUPS';
  if (permLoading) return <div>Loading permissions...</div>;
  if (!hasPermission(permissions, REQUIRED_PERMISSION)) {
    return <div className="alert alert-danger mt-4">You do not have permission to view admin user groups.</div>;
  }
  return (
    <div className="container py-3">
      <h2 className="mb-3">Admin - User Groups</h2>
      <UserGroupAdminPage />
    </div>
  );
}
