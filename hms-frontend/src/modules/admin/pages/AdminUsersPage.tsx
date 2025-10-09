import React from 'react';

export function AdminUsersPage() {
  return (
    <div className="container py-3">
      <h2 className="mb-3">Admin - Users</h2>
      <p className="text-muted mb-4">Placeholder page. Future: searchable user directory, create/edit modal, role assignment matrix.</p>
      <div className="alert alert-info">Implementation pending: integrate with /api/v1/admin/users endpoints.</div>
    </div>
  );
}
