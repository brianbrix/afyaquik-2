import { apiClient } from './apiClient';
import { ApiEnvelope } from './apiClient';

export interface SystemHealthMetrics {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'DOWN';
  totalMemory: number;
  usedMemory: number;
  freeMemory: number;
  memoryUsagePercent: number;
  uptime: number;
  availableProcessors: number;
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  activeUsers: number;
  superAdmins: number;
  timestamp: string;
}

export interface SystemPerformanceMetrics {
  heapUsed: number;
  heapMax: number;
  nonHeapUsed: number;
  nonHeapMax: number;
  gcCount: number;
  gcTime: number;
  uptime: number;
  threadCount: number;
  peakThreadCount: number;
}

export interface DatabaseStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  activeUsers: number;
  superAdmins: number;
}

export const systemHealthApi = {
  // Get system health metrics
  getSystemHealth: () =>
    apiClient.get<ApiEnvelope<SystemHealthMetrics>>('/super-admin/system/health').then(res => res.data.data),

  // Get system performance metrics
  getSystemPerformance: () =>
    apiClient.get<ApiEnvelope<SystemPerformanceMetrics>>('/super-admin/system/performance').then(res => res.data.data),

  // Get database statistics
  getDatabaseStats: () =>
    apiClient.get<ApiEnvelope<DatabaseStats>>('/super-admin/system/database').then(res => res.data.data)
};
