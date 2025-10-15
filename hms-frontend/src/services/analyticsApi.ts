import { apiClient } from './apiClient';

export interface AnalyticsMetrics {
  systemOverview: SystemOverview;
  userAnalytics: UserAnalytics;
  patientAnalytics: PatientAnalytics;
  queueAnalytics: QueueAnalytics;
  financialAnalytics: FinancialAnalytics;
  departmentAnalytics: DepartmentAnalytics;
  timeBasedAnalytics: TimeBasedAnalytics;
  performanceMetrics: PerformanceMetrics;
}

export interface SystemOverview {
  totalUsers: number;
  activeUsers: number;
  totalPatients: number;
  totalQueueItems: number;
  totalBills: number;
  totalRevenue: number;
  totalPrescriptions: number;
  totalDiagnosticOrders: number;
  systemUptime: string;
  systemLoad: number;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
  usersByDepartment: Record<string, number>;
  recentUserActivity: UserActivity[];
  activeSessions: UserSession[];
}

export interface PatientAnalytics {
  totalPatients: number;
  newPatientsToday: number;
  newPatientsThisWeek: number;
  newPatientsThisMonth: number;
  patientsByGender: Record<string, number>;
  patientsByAgeGroup: Record<string, number>;
  patientsByInsurance: Record<string, number>;
  recentVisits: PatientVisit[];
  averageVisitsPerPatient: number;
}

export interface QueueAnalytics {
  totalQueueItems: number;
  pendingItems: number;
  completedItems: number;
  cancelledItems: number;
  itemsByStatus: Record<string, number>;
  itemsByDepartment: Record<string, number>;
  averageWaitTime: number;
  averageProcessingTime: number;
  queueTrends: QueueTrend[];
  bottlenecks: QueueBottleneck[];
}

export interface FinancialAnalytics {
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  totalBills: number;
  paidBills: number;
  pendingBills: number;
  cancelledBills: number;
  revenueByDepartment: Record<string, number>;
  revenueByService: Record<string, number>;
  revenueTrends: FinancialTrend[];
  paymentMethodStats: PaymentMethod[];
}

export interface DepartmentAnalytics {
  departmentStats: Record<string, DepartmentStats>;
  topPerformers: DepartmentPerformance[];
  underPerformers: DepartmentPerformance[];
  workloadDistribution: Record<string, number>;
}

export interface TimeBasedAnalytics {
  hourlyActivity: Record<string, number>;
  dailyActivity: Record<string, number>;
  weeklyActivity: Record<string, number>;
  monthlyActivity: Record<string, number>;
  peakHours: PeakHours[];
  seasonalTrends: SeasonalTrend[];
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  systemAvailability: number;
  totalErrors: number;
  errorsToday: number;
  errorsByType: Record<string, number>;
  systemAlerts: SystemAlert[];
  performanceIssues: PerformanceIssue[];
}

// Supporting interfaces
export interface UserActivity {
  username: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface UserSession {
  username: string;
  loginTime: string;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
}

export interface PatientVisit {
  patientName: string;
  visitDate: string;
  department: string;
  status: string;
  doctor: string;
}

export interface QueueTrend {
  date: string;
  count: number;
  status: string;
}

export interface QueueBottleneck {
  department: string;
  status: string;
  count: number;
  averageWaitTime: number;
}

export interface FinancialTrend {
  date: string;
  amount: number;
  category: string;
}

export interface PaymentMethod {
  method: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface DepartmentStats {
  department: string;
  totalPatients: number;
  totalQueueItems: number;
  totalRevenue: number;
  averageWaitTime: number;
  satisfactionScore: number;
}

export interface DepartmentPerformance {
  department: string;
  performanceScore: number;
  metrics: string;
}

export interface PeakHours {
  hour: string;
  activityCount: number;
  department: string;
}

export interface SeasonalTrend {
  period: string;
  count: number;
  trend: string;
}

export interface SystemAlert {
  type: string;
  message: string;
  severity: string;
  timestamp: string;
}

export interface PerformanceIssue {
  component: string;
  issue: string;
  severity: string;
  recommendation: string;
}

export const analyticsApi = {
  /**
   * Get comprehensive system analytics.
   */
  async getSystemAnalytics(): Promise<AnalyticsMetrics> {
    const response = await apiClient.get('/analytics');
    return response.data?.data ?? response.data;
  },

  /**
   * Get analytics for a specific date range.
   */
  async getAnalyticsByDateRange(startDate: string, endDate: string): Promise<AnalyticsMetrics> {
    const response = await apiClient.get('/analytics/date-range', {
      params: { startDate, endDate }
    });
    return response.data?.data ?? response.data;
  },

  /**
   * Get real-time dashboard metrics.
   */
  async getRealTimeMetrics(): Promise<SystemOverview> {
    const response = await apiClient.get('/analytics/realtime');
    return response.data?.data ?? response.data;
  },

  /**
   * Get system overview metrics.
   */
  async getSystemOverview(): Promise<SystemOverview> {
    const response = await apiClient.get('/analytics/overview');
    return response.data?.data ?? response.data;
  },

  /**
   * Get user analytics.
   */
  async getUserAnalytics(): Promise<UserAnalytics> {
    const response = await apiClient.get('/analytics/users');
    return response.data?.data ?? response.data;
  },

  /**
   * Get patient analytics.
   */
  async getPatientAnalytics(): Promise<PatientAnalytics> {
    const response = await apiClient.get('/analytics/patients');
    return response.data?.data ?? response.data;
  },

  /**
   * Get queue analytics.
   */
  async getQueueAnalytics(): Promise<QueueAnalytics> {
    const response = await apiClient.get('/analytics/queue');
    return response.data?.data ?? response.data;
  },

  /**
   * Get financial analytics.
   */
  async getFinancialAnalytics(): Promise<FinancialAnalytics> {
    const response = await apiClient.get('/analytics/financial');
    return response.data?.data ?? response.data;
  },

  /**
   * Get department analytics.
   */
  async getDepartmentAnalytics(): Promise<DepartmentAnalytics> {
    const response = await apiClient.get('/analytics/departments');
    return response.data?.data ?? response.data;
  },

  /**
   * Get time-based analytics.
   */
  async getTimeBasedAnalytics(): Promise<TimeBasedAnalytics> {
    const response = await apiClient.get('/analytics/time-based');
    return response.data?.data ?? response.data;
  },

  /**
   * Get performance metrics.
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const response = await apiClient.get('/analytics/performance');
    return response.data?.data ?? response.data;
  }
};
