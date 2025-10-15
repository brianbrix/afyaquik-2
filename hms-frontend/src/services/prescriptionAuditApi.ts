import { apiClient } from './apiClient';

export interface PrescriptionAudit {
  id: number;
  prescriptionId: number;
  actionType: 'CREATED' | 'UPDATED' | 'DISPENSED' | 'PARTIALLY_DISPENSED' | 'CANCELLED' | 'REVERSED' | 'REPLACED' | 'EXPIRED' | 'STATUS_CHANGED';
  previousStatus?: string;
  newStatus?: string;
  actionBy: string;
  actionAt: string;
  reason?: string;
  changesSummary?: string;
  prescriptionData?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionAuditFilters {
  actionType?: string;
  actionBy?: string;
  startDate?: string;
  endDate?: string;
}

export const prescriptionAuditApi = {
  /**
   * Get audit trail for a specific prescription
   */
  getPrescriptionAuditTrail: async (prescriptionId: number): Promise<PrescriptionAudit[]> => {
    const response = await apiClient.get(`/pharmacy/prescription-audit/prescription/${prescriptionId}`);
    return response.data.data;
  },

  /**
   * Get audit entries by action type
   */
  getAuditByActionType: async (actionType: string): Promise<PrescriptionAudit[]> => {
    const response = await apiClient.get(`/pharmacy/prescription-audit/action/${actionType}`);
    return response.data.data;
  },

  /**
   * Get audit entries for a specific user
   */
  getAuditByUser: async (actionBy: string): Promise<PrescriptionAudit[]> => {
    const response = await apiClient.get(`/pharmacy/prescription-audit/user/${actionBy}`);
    return response.data.data;
  },

  /**
   * Get latest audit entry for a prescription
   */
  getLatestAuditEntry: async (prescriptionId: number): Promise<PrescriptionAudit | null> => {
    const response = await apiClient.get(`/pharmacy/prescription-audit/prescription/${prescriptionId}/latest`);
    return response.data.data;
  },

  /**
   * Get audit entries within a date range
   */
  getAuditByDateRange: async (startDate: string, endDate: string): Promise<PrescriptionAudit[]> => {
    const response = await apiClient.get(`/pharmacy/prescription-audit/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data;
  }
};
