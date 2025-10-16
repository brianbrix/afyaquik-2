import { apiClient } from './apiClient';

export interface ReportRequest {
  reportType: string;
  startDate?: string;
  endDate?: string;
  departments?: string[];
  users?: string[];
  format?: string;
  includeCharts?: boolean;
  timezone?: string;
  filters?: {
    patientStatus?: string;
    billStatus?: string;
    queueStatus?: string;
    userRole?: string;
    department?: string;
    minAmount?: number;
    maxAmount?: number;
    gender?: string;
    minAge?: number;
    maxAge?: number;
  };
}

export interface ReportResponse {
  reportId: string;
  reportType: string;
  title: string;
  generatedAt: string;
  generatedBy: string;
  status: string;
  downloadUrl?: string;
  fileFormat: string;
  fileSize?: number;
  summary: {
    totalRecords: number;
    totalAmount?: number;
    totalPatients?: number;
    totalBills?: number;
    totalUsers?: number;
    dateRange: string;
    generatedBy: string;
    generatedAt: string;
  };
  sections: Array<{
    sectionTitle: string;
    sectionType: string;
    data: Array<{
      label: string;
      value: any;
      category: string;
      attributes?: Record<string, any>;
    }>;
    charts?: Record<string, any>;
    description: string;
  }>;
  metadata?: Record<string, any>;
}

export const reportsApi = {
  // Generate patient report
  generatePatientReport: (request: ReportRequest): Promise<ReportResponse> => {
    return apiClient.post('/reports/patient', request);
  },

  // Generate financial report
  generateFinancialReport: (request: ReportRequest): Promise<ReportResponse> => {
    return apiClient.post('/reports/financial', request);
  },

  // Generate operational report
  generateOperationalReport: (request: ReportRequest): Promise<ReportResponse> => {
    return apiClient.post('/reports/operational', request);
  },

  // Generate system report
  generateSystemReport: (request: ReportRequest): Promise<ReportResponse> => {
    return apiClient.post('/reports/system', request);
  },
  // Generate billing report
  generateBillingReport: (request: ReportRequest): Promise<ReportResponse> => {
    return apiClient.post('/reports/billing', request);
  },

  // Generate queue report
  generateQueueReport: (request: ReportRequest): Promise<ReportResponse> => {
    return apiClient.post('/reports/queue', request);
  },

  // Generate user activity report
  generateUserActivityReport: (request: ReportRequest): Promise<ReportResponse> => {
    return apiClient.post('/reports/user-activity', request);
  },

  // Get report by date range
  getReportByDateRange: (params: {
    reportType: string;
    startDate?: string;
    endDate?: string;
    format?: string;
    departments?: string[];
    users?: string[];
  }): Promise<ReportResponse> => {
    return apiClient.get('/reports/date-range', { params });
  },

  // Get dashboard metrics
  getDashboardMetrics: (): Promise<ReportResponse> => {
    return apiClient.get('/reports/dashboard');
  },

  // Get available report types
  getReportTypes: (): Promise<string[]> => {
    return apiClient.get('/reports/types');
  },

  // Export report
  exportReport: (request: ReportRequest): Promise<ReportResponse> => {
    return apiClient.post('/reports/export', request);
  },

  // Download report
  downloadReport: (reportId: string): Promise<Blob> => {
    return apiClient.get(`/reports/download/${reportId}`, {
      responseType: 'blob'
    });
  }
};
