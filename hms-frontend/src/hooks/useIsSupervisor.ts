import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';

interface SupervisorCheckResponse {
  isSupervisor: boolean;
  supervisedUsersCount: number;
}

export function useIsSupervisor() {
  return useQuery({
    queryKey: ['user', 'is-supervisor'],
    queryFn: async (): Promise<SupervisorCheckResponse> => {
      const res = await apiClient.get('/auth/me/supervisor-status');
      return res.data?.data ?? res.data;
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnMount: true, // Always refetch on component mount
    refetchOnWindowFocus: true, // Refetch when window gains focus
    initialData: { isSupervisor: false, supervisedUsersCount: 0 }
  });
}
