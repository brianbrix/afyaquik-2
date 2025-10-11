import { useAuth } from '../hooks/useAuth';
import { useRoleContext } from '../hooks/useRoleContext';
import { apiClient } from '../services/apiClient';
import { useEffect, useState } from 'react';

export type PermissionMatrix = Record<string, 'UNSET' | 'ALLOWED' | 'NOT_ALLOWED'>;

export function useResolvedPermissions() {
  const { user } = useAuth();
  const { activeRole } = useRoleContext();
  const [permissions, setPermissions] = useState<PermissionMatrix>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    apiClient.get('/api/v1/permissions/resolve')
      .then(res => setPermissions(res.data.permissions))
      .finally(() => setLoading(false));
  }, [user, activeRole]);

  return { permissions, loading };
}

export function hasPermission(permissions: PermissionMatrix, code: string): boolean {
  return permissions[code] === 'ALLOWED';
}
