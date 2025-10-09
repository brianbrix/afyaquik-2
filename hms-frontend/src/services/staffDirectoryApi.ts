import { apiClient } from './apiClient';
import { useQuery } from '@tanstack/react-query';

export interface StaffDirectoryEntry {
  id: number;
  username: string;
  displayName: string;
  roles: string[];
  departments: string[]; // currently empty until backend supplies
}

async function fetchStaff(q?: string): Promise<StaffDirectoryEntry[]> {
  const res = await apiClient.get('/api/v1/directory/staff', { params: q ? { q } : undefined });
  const data = res.data?.data ?? res.data;
  return data as StaffDirectoryEntry[];
}

export function useStaffDirectory(enabled: boolean = true, q?: string) {
  return useQuery({ queryKey: ['directory','staff', q || 'all'], queryFn: () => fetchStaff(q), staleTime: 60_000, enabled });
}
