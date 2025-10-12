import React from 'react';
import { useResolvedPermissions, hasPermission } from '../../../hooks/usePermissions';

export function AdminDepartmentsPage() {
  const { permissions, loading: permLoading } = useResolvedPermissions();
  const REQUIRED_PERMISSION = 'ADMIN_DEPARTMENTS';
  if (permLoading) return <div>Loading permissions...</div>;
  if (!hasPermission(permissions, REQUIRED_PERMISSION)) {
    return <div className="alert alert-danger mt-4">You do not have permission to view admin departments.</div>;
  }
  return (
    <div className="container py-3">
      <h2 className="mb-3">Admin - Departments</h2>
      <p className="text-muted mb-4">Placeholder page. Future: department tree/hierarchy, create/edit, assign metadata for workflows.</p>
      <div className="alert alert-info">Implementation pending: integrate with /admin/departments endpoints.</div>
    </div>
  );
}
