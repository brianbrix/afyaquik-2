import { useAuth } from '../hooks/useAuth';
import { useRoleContext } from '../hooks/useRoleContext';
import { apiClient } from '../services/apiClient';
import { useQuery } from '@tanstack/react-query';
import { offlinePermissionService } from '../services/offlinePermissionService';
import { useEffect } from 'react';

export type PermissionMatrix = Record<string, 'UNSET' | 'ALLOWED' | 'NOT_ALLOWED'>;

export function useResolvedPermissions() {
  const { user } = useAuth();
  const { activeRole } = useRoleContext();
  
  const { data: permissions = {}, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['permissions', user?.username, activeRole],
    queryFn: async (): Promise<PermissionMatrix> => {
      // Check if we're offline
      if (!navigator.onLine) {
        console.log('Offline mode - using cached permissions from offline service');
        // Try to get permissions from offline service
        const offlinePermissions = offlinePermissionService.getCachedPermissions();
        if (offlinePermissions && Object.keys(offlinePermissions).length > 0) {
          return offlinePermissions;
        }
        // If no cached permissions, return empty object
        console.warn('No cached permissions found in offline mode');
        return {};
      }
      
      // Online mode - fetch from API
      const res = await apiClient.get('/permissions/resolve');
      return res.data.permissions;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: (failureCount, error) => {
      // Don't retry if offline
      if (!navigator.onLine) {
        return false;
      }
      // Retry up to 3 times when online
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch on mount
  });

  // Update offline permission service when permissions are fetched
  useEffect(() => {
    if (permissions && Object.keys(permissions).length > 0) {
      offlinePermissionService.updateSessionPermissions(permissions);
    }
  }, [permissions]);

  // Handle offline permission errors gracefully
  const isOfflineError = error && !navigator.onLine;
  const hasCachedPermissions = Object.keys(permissions).length > 0;
  
  return { 
    permissions, 
    loading, 
    error: isOfflineError && !hasCachedPermissions ? null : error, // Don't show error if we have cached permissions
    refetch 
  };
}

export function hasPermission(permissions: PermissionMatrix, code: string): boolean {
  return permissions[code] === 'ALLOWED';
}
