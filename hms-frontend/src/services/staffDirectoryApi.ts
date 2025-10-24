import { apiClient } from './apiClient';
import { useQuery } from '@tanstack/react-query';
import { localDatabaseService, type LocalStaff } from './localDatabase';

export interface StaffDirectoryEntry {
  id: number;
  username: string;
  displayName: string;
  roles: string[];
  departments: string[]; // currently empty until backend supplies
}

async function fetchStaff(q?: string): Promise<StaffDirectoryEntry[]> {
  // Check if we're offline
  if (!navigator.onLine) {
    return await fetchStaffOffline(q);
  }

  try {
    const res = await apiClient.get('/directory/staff', { params: q ? { q } : undefined });
    const data = res.data?.data ?? res.data;
    return data as StaffDirectoryEntry[];
  } catch (error) {
    // If API call fails, fall back to offline data
    console.warn('API call failed, falling back to offline data:', error);
    return await fetchStaffOffline(q);
  }
}

async function fetchStaffOffline(q?: string): Promise<StaffDirectoryEntry[]> {
  try {
    // Initialize local database if not already done
    await localDatabaseService.initialize();
    
    let staff: LocalStaff[];
    
    if (q && q.trim()) {
      // Search staff with query
      staff = await localDatabaseService.searchStaff(q.trim());
    } else {
      // Get all staff
      staff = await localDatabaseService.getAllStaff();
    }
    
    // Convert LocalStaff to StaffDirectoryEntry
    return staff.map(s => ({
      id: s.id,
      username: s.username,
      displayName: s.displayName,
      roles: s.roles || [],
      departments: [] // Currently empty until backend supplies
    }));
  } catch (error) {
    console.error('Offline staff fetch failed:', error);
    return [];
  }
}

export function useStaffDirectory(enabled: boolean = true, q?: string) {
  return useQuery({ queryKey: ['directory','staff', q || 'all'], queryFn: () => fetchStaff(q), staleTime: 60_000, enabled });
}
