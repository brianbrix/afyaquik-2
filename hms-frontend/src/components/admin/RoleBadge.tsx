import React from 'react';
import { AdminRole } from '../../services/adminApi';

interface RoleBadgeProps { role: Pick<AdminRole,'roleKey'|'displayName'>; size?: 'sm'|'md'; }

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size='sm' }) => {
  const variant = role.roleKey.toLowerCase().includes('admin') ? 'danger' : 'secondary';
  const cls = `badge text-bg-${variant} ${size==='md' ? 'py-2 px-3' : 'py-1 px-2'} fw-normal`;
  return <span className={cls} title={role.roleKey}>{role.displayName}</span>;
};
