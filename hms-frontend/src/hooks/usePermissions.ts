import { useAuth } from '../hooks/useAuth';
import { useRoleContext } from '../hooks/useRoleContext';
import { apiClient } from '../services/apiClient';
import { useQuery } from '@tanstack/react-query';

export type PermissionMatrix = Record<string, 'UNSET' | 'ALLOWED' | 'NOT_ALLOWED'>;

export function useResolvedPermissions() {
  const { user } = useAuth();
  const { activeRole } = useRoleContext();
  
  const { data: permissions = {}, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['permissions', user?.username, activeRole],
    queryFn: async (): Promise<PermissionMatrix> => {
      const res = await apiClient.get('/permissions/resolve');
      return res.data.permissions;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch on mount
  });

  return { permissions, loading, error, refetch };
}

export function hasPermission(permissions: PermissionMatrix, code: string): boolean {
  return permissions[code] === 'ALLOWED';
}
