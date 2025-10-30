import React from 'react';
import { useResolvedPermissions, hasPermission } from '../../../hooks/usePermissions';
import { UserDirectory } from '../../../components/admin/UserDirectory';

export function AdminUsersPage() {
  const { permissions, loading: permLoading } = useResolvedPermissions();
  const REQUIRED_PERMISSION = 'ADMIN_USERS';
  if (permLoading) return <div>Loading permissions...</div>;
  if (!hasPermission(permissions, REQUIRED_PERMISSION)) {
    return <div className="alert alert-danger mt-4">You do not have permission to view admin users.</div>;
  }
  return <UserDirectory />;
}
