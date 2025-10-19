import { apiClient } from './apiClient';
import { ApiEnvelope } from './apiClient';

export interface TableSchema {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  character_maximum_length: number | null;
}

export interface TableData {
  content: Record<string, any>[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface DatabaseStats {
  tableCount: number;
  totalRows: number;
  tableRowCounts: Record<string, number>;
}

export const databaseRecordsApi = {
  // Get all database tables
  getAllTables: () =>
    apiClient.get<ApiEnvelope<string[]>>('/super-admin/database/tables').then(res => res.data.data),

  // Get table schema
  getTableSchema: (tableName: string) =>
    apiClient.get<ApiEnvelope<TableSchema[]>>(`/super-admin/database/tables/${tableName}/schema`).then(res => res.data.data),

  // Get table data with pagination
  getTableData: (tableName: string, page: number = 0, size: number = 100, search?: string, sortBy?: string, sortDirection: string = 'asc', tenantId?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    params.append('sortDirection', sortDirection);
    if (tenantId) params.append('tenantId', tenantId);
    
    return apiClient.get<ApiEnvelope<TableData>>(`/super-admin/database/tables/${tableName}/data?${params.toString()}`).then(res => res.data.data);
  },

  // Export table to CSV
  exportTableToCsv: (tableName: string, search?: string, sortBy?: string, sortDirection: string = 'asc') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    params.append('sortDirection', sortDirection);
    
    return apiClient.get(`/super-admin/database/tables/${tableName}/export/csv?${params.toString()}`, {
      responseType: 'blob'
    }).then(res => {
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tableName}_export.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  },

  // Export table to Excel
  exportTableToExcel: (tableName: string, search?: string, sortBy?: string, sortDirection: string = 'asc') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    params.append('sortDirection', sortDirection);
    
    return apiClient.get(`/super-admin/database/tables/${tableName}/export/excel?${params.toString()}`, {
      responseType: 'blob'
    }).then(res => {
      const blob = new Blob([res.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tableName}_export.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  },

  // Get database statistics
  getDatabaseStats: () =>
    apiClient.get<ApiEnvelope<DatabaseStats>>('/super-admin/database/stats').then(res => res.data.data),

  // Get all tenants for filtering
  getAllTenants: () =>
    apiClient.get<ApiEnvelope<{ tenantCode: string; tenantName: string }[]>>('/super-admin/tenants').then(res => res.data.data)
};
