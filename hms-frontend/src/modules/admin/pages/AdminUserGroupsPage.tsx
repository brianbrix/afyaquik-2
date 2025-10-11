import React from 'react';
import UserGroupAdminPage from '../user-groups/UserGroupAdminPage';

export function AdminUserGroupsPage() {
  return (
    <div className="container py-3">
      <h2 className="mb-3">Admin - User Groups</h2>
      <UserGroupAdminPage />
    </div>
  );
}
