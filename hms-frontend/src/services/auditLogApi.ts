import { apiClient } from './apiClient';

export interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId?: number;
  oldValues?: string;
  newValues?: string;
  userId: number;
  username: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  endpoint?: string;
  httpMethod?: string;
  responseStatus?: number;
  durationMs?: number;
  status: string;
  errorMessage?: string;
  timestamp: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogFilter {
  startDate?: string;
  endDate?: string;
  actions?: string[];
  entityTypes?: string[];
  userIds?: number[];
  usernames?: string[];
  statuses?: string[];
  ipAddress?: string;
  sessionId?: string;
  requestId?: string;
  endpoint?: string;
  httpMethod?: string;
  minResponseStatus?: number;
  maxResponseStatus?: number;
  minDurationMs?: number;
  maxDurationMs?: number;
  searchTerm?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface AuditLogStatistics {
  totalLogs: number;
  successLogs: number;
  errorLogs: number;
  avgDuration: number;
  maxDuration: number;
  minDuration: number;
}

export const auditLogApi = {
  /**
   * Get audit logs with pagination and filtering.
   */
  async getAuditLogs(filter: AuditLogFilter = {}): Promise<{ content: AuditLog[]; totalElements: number; totalPages: number; size: number; number: number }> {
    const params = new URLSearchParams();
    
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    if (filter.actions) filter.actions.forEach(action => params.append('actions', action));
    if (filter.entityTypes) filter.entityTypes.forEach(type => params.append('entityTypes', type));
    if (filter.userIds) filter.userIds.forEach(id => params.append('userIds', id.toString()));
    if (filter.usernames) filter.usernames.forEach(username => params.append('usernames', username));
    if (filter.statuses) filter.statuses.forEach(status => params.append('statuses', status));
    if (filter.ipAddress) params.append('ipAddress', filter.ipAddress);
    if (filter.sessionId) params.append('sessionId', filter.sessionId);
    if (filter.requestId) params.append('requestId', filter.requestId);
    if (filter.endpoint) params.append('endpoint', filter.endpoint);
    if (filter.httpMethod) params.append('httpMethod', filter.httpMethod);
    if (filter.minResponseStatus) params.append('minResponseStatus', filter.minResponseStatus.toString());
    if (filter.maxResponseStatus) params.append('maxResponseStatus', filter.maxResponseStatus.toString());
    if (filter.minDurationMs) params.append('minDurationMs', filter.minDurationMs.toString());
    if (filter.maxDurationMs) params.append('maxDurationMs', filter.maxDurationMs.toString());
    if (filter.searchTerm) params.append('searchTerm', filter.searchTerm);
    if (filter.page !== undefined) params.append('page', filter.page.toString());
    if (filter.size !== undefined) params.append('size', filter.size.toString());
    if (filter.sortBy) params.append('sortBy', filter.sortBy);
    if (filter.sortDirection) params.append('sortDirection', filter.sortDirection);

    const response = await apiClient.get(`/audit-logs?${params.toString()}`);
    return response.data?.data ?? response.data;
  },

  /**
   * Get audit logs by date range.
   */
  async getAuditLogsByDateRange(startDate: string, endDate: string, page: number = 0, size: number = 20): Promise<{ content: AuditLog[]; totalElements: number; totalPages: number; size: number; number: number }> {
    const response = await apiClient.get(`/audit-logs/date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`);
    return response.data?.data ?? response.data;
  },

  /**
   * Get audit logs by user.
   */
  async getAuditLogsByUser(userId: number, page: number = 0, size: number = 20): Promise<{ content: AuditLog[]; totalElements: number; totalPages: number; size: number; number: number }> {
    const response = await apiClient.get(`/audit-logs/user/${userId}?page=${page}&size=${size}`);
    return response.data?.data ?? response.data;
  },

  /**
   * Get audit logs by action.
   */
  async getAuditLogsByAction(action: string, page: number = 0, size: number = 20): Promise<{ content: AuditLog[]; totalElements: number; totalPages: number; size: number; number: number }> {
    const response = await apiClient.get(`/audit-logs/action/${action}?page=${page}&size=${size}`);
    return response.data?.data ?? response.data;
  },

  /**
   * Get audit logs by entity type.
   */
  async getAuditLogsByEntityType(entityType: string, page: number = 0, size: number = 20): Promise<{ content: AuditLog[]; totalElements: number; totalPages: number; size: number; number: number }> {
    const response = await apiClient.get(`/audit-logs/entity-type/${entityType}?page=${page}&size=${size}`);
    return response.data?.data ?? response.data;
  },

  /**
   * Get audit logs by status.
   */
  async getAuditLogsByStatus(status: string, page: number = 0, size: number = 20): Promise<{ content: AuditLog[]; totalElements: number; totalPages: number; size: number; number: number }> {
    const response = await apiClient.get(`/audit-logs/status/${status}?page=${page}&size=${size}`);
    return response.data?.data ?? response.data;
  },

  /**
   * Search audit logs by term.
   */
  async searchAuditLogs(searchTerm: string, page: number = 0, size: number = 20): Promise<{ content: AuditLog[]; totalElements: number; totalPages: number; size: number; number: number }> {
    const response = await apiClient.get(`/audit-logs/search?q=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}`);
    return response.data?.data ?? response.data;
  },

  /**
   * Get distinct actions.
   */
  async getDistinctActions(): Promise<string[]> {
    const response = await apiClient.get('/audit-logs/distinct/actions');
    return response.data?.data ?? response.data;
  },

  /**
   * Get distinct entity types.
   */
  async getDistinctEntityTypes(): Promise<string[]> {
    const response = await apiClient.get('/audit-logs/distinct/entity-types');
    return response.data?.data ?? response.data;
  },

  /**
   * Get distinct statuses.
   */
  async getDistinctStatuses(): Promise<string[]> {
    const response = await apiClient.get('/audit-logs/distinct/statuses');
    return response.data?.data ?? response.data;
  },

  /**
   * Get distinct HTTP methods.
   */
  async getDistinctHttpMethods(): Promise<string[]> {
    const response = await apiClient.get('/audit-logs/distinct/http-methods');
    return response.data?.data ?? response.data;
  },

  /**
   * Get audit log statistics.
   */
  async getAuditLogStatistics(): Promise<AuditLogStatistics> {
    const response = await apiClient.get('/audit-logs/statistics');
    return response.data?.data ?? response.data;
  },

  /**
   * Get audit log statistics for a date range.
   */
  async getAuditLogStatisticsForDateRange(startDate: string, endDate: string): Promise<AuditLogStatistics> {
    const response = await apiClient.get(`/audit-logs/statistics/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data?.data ?? response.data;
  },

  /**
   * Export audit logs to CSV.
   */
  async exportAuditLogsToCsv(filter: AuditLogFilter = {}): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    if (filter.actions) filter.actions.forEach(action => params.append('actions', action));
    if (filter.entityTypes) filter.entityTypes.forEach(type => params.append('entityTypes', type));
    if (filter.userIds) filter.userIds.forEach(id => params.append('userIds', id.toString()));
    if (filter.usernames) filter.usernames.forEach(username => params.append('usernames', username));
    if (filter.statuses) filter.statuses.forEach(status => params.append('statuses', status));
    if (filter.ipAddress) params.append('ipAddress', filter.ipAddress);
    if (filter.sessionId) params.append('sessionId', filter.sessionId);
    if (filter.requestId) params.append('requestId', filter.requestId);
    if (filter.endpoint) params.append('endpoint', filter.endpoint);
    if (filter.httpMethod) params.append('httpMethod', filter.httpMethod);
    if (filter.minResponseStatus) params.append('minResponseStatus', filter.minResponseStatus.toString());
    if (filter.maxResponseStatus) params.append('maxResponseStatus', filter.maxResponseStatus.toString());
    if (filter.minDurationMs) params.append('minDurationMs', filter.minDurationMs.toString());
    if (filter.maxDurationMs) params.append('maxDurationMs', filter.maxDurationMs.toString());
    if (filter.searchTerm) params.append('searchTerm', filter.searchTerm);

    const response = await apiClient.get(`/audit-logs/export/csv?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Export audit logs to JSON.
   */
  async exportAuditLogsToJson(filter: AuditLogFilter = {}): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    if (filter.actions) filter.actions.forEach(action => params.append('actions', action));
    if (filter.entityTypes) filter.entityTypes.forEach(type => params.append('entityTypes', type));
    if (filter.userIds) filter.userIds.forEach(id => params.append('userIds', id.toString()));
    if (filter.usernames) filter.usernames.forEach(username => params.append('usernames', username));
    if (filter.statuses) filter.statuses.forEach(status => params.append('statuses', status));
    if (filter.ipAddress) params.append('ipAddress', filter.ipAddress);
    if (filter.sessionId) params.append('sessionId', filter.sessionId);
    if (filter.requestId) params.append('requestId', filter.requestId);
    if (filter.endpoint) params.append('endpoint', filter.endpoint);
    if (filter.httpMethod) params.append('httpMethod', filter.httpMethod);
    if (filter.minResponseStatus) params.append('minResponseStatus', filter.minResponseStatus.toString());
    if (filter.maxResponseStatus) params.append('maxResponseStatus', filter.maxResponseStatus.toString());
    if (filter.minDurationMs) params.append('minDurationMs', filter.minDurationMs.toString());
    if (filter.maxDurationMs) params.append('maxDurationMs', filter.maxDurationMs.toString());
    if (filter.searchTerm) params.append('searchTerm', filter.searchTerm);

    const response = await apiClient.get(`/audit-logs/export/json?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
