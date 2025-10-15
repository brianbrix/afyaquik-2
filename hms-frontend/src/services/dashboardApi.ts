import { apiClient } from './apiClient';

export interface DashboardStats {
  // System stats
  totalPatients?: number;
  pendingCheckIn?: number;
  inTriage?: number;
  inConsult?: number;
  inDiagnostics?: number;
  inPharmacy?: number;
  inBilling?: number;
  blocked?: number;
  closed?: number;
  totalBills?: number;
  pendingBills?: number;
  paidBills?: number;
  totalDiagnosticOrders?: number;
  pendingDiagnostics?: number;
  
  // User-specific stats
  myAssignedItems?: number;
  myPendingItems?: number;
  myInProgressItems?: number;
  todayShiftStatus?: string;
  isOnShift?: boolean;
  myPendingTimeOff?: number;
  myApprovedTimeOff?: number;
  
  // Supervisor stats
  isSupervisor?: boolean;
  teamMembers?: number;
  pendingTeamTimeOff?: number;
  
  // Admin stats
  isAdmin?: boolean;
  totalUsers?: number;
  activeUsers?: number;
}

export const dashboardApi = {
  getSystemDashboard: (): Promise<DashboardStats> =>
    apiClient.get('/dashboard/system').then(res => res.data.data),
    
  getUserDashboard: (): Promise<DashboardStats> =>
    apiClient.get('/dashboard/user').then(res => res.data.data),
};

