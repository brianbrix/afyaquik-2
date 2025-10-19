import { apiClient } from './apiClient';
import { ApiEnvelope } from './apiClient';

export interface SuperAdminUser {
  id: number;
  username: string;
  displayName: string;
  email: string;
  isActive: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuperAdminLoginRequest {
  username: string;
  password: string;
}

export interface SuperAdminLoginResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
  user: SuperAdminUser;
}

export interface SuperAdminRefreshResponse {
  accessToken: string;
  expiresIn: number;
}

export interface Permission {
  id: number;
  code: string;
  description: string;
}

export interface CreateSuperAdminUserRequest {
  username: string;
  displayName: string;
  email: string;
  password: string;
}

export interface UpdateSuperAdminUserRequest {
  displayName: string;
  email: string;
  password?: string;
  isActive: boolean;
}

// Helper function to clean filter parameters
const cleanFilterParams = (filter: any) => {
  return Object.fromEntries(
    Object.entries(filter).filter(([_, value]) => 
      value !== undefined && 
      value !== null && 
      value !== '' && 
      value !== 'undefined'
    )
  );
};

export const superAdminApi = {
  // Super Admin Authentication
  login: (credentials: SuperAdminLoginRequest) =>
    apiClient.post<ApiEnvelope<SuperAdminLoginResponse>>('/super-admin/auth/login', credentials).then(res => res.data.data),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiEnvelope<SuperAdminRefreshResponse>>('/super-admin/auth/refresh', { refreshToken }).then(res => res.data.data),

  logout: () =>
    apiClient.post<ApiEnvelope<void>>('/super-admin/auth/logout').then(res => res.data.data),

  getProfile: () =>
    apiClient.get<ApiEnvelope<SuperAdminUser>>('/super-admin/auth/me').then(res => res.data.data),

  // Get all super admin users
  getAllUsers: () =>
    apiClient.get<ApiEnvelope<SuperAdminUser[]>>('/super-admin/users').then(res => res.data.data),

  // Get active super admin users
  getActiveUsers: () =>
    apiClient.get<ApiEnvelope<SuperAdminUser[]>>('/super-admin/users/active').then(res => res.data.data),

  // Create super admin user
  createUser: (user: CreateSuperAdminUserRequest) =>
    apiClient.post<ApiEnvelope<SuperAdminUser>>('/super-admin/users', user).then(res => res.data.data),

  // Update super admin user
  updateUser: (id: number, user: UpdateSuperAdminUserRequest) =>
    apiClient.put<ApiEnvelope<SuperAdminUser>>(`/super-admin/users/${id}`, user).then(res => res.data.data),

  // Deactivate super admin user
  deactivateUser: (id: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/super-admin/users/${id}`).then(res => res.data.data),


  // Check super admin access
  checkAccess: () =>
    apiClient.get<ApiEnvelope<boolean>>('/super-admin/check-access').then(res => res.data.data),

  // Audit Logs for Super Admin
  getAuditLogs: (filter: any = {}) => {
    const cleanFilter = cleanFilterParams(filter);
    return apiClient.get<ApiEnvelope<any>>(`/super-admin/audit-logs?${new URLSearchParams(cleanFilter).toString()}`).then(res => res.data.data);
  },

  getDistinctActions: () =>
    apiClient.get<ApiEnvelope<string[]>>('/super-admin/audit-logs/distinct/actions').then(res => res.data.data),

  getDistinctEntityTypes: () =>
    apiClient.get<ApiEnvelope<string[]>>('/super-admin/audit-logs/distinct/entity-types').then(res => res.data.data),

  getDistinctStatuses: () =>
    apiClient.get<ApiEnvelope<string[]>>('/super-admin/audit-logs/distinct/statuses').then(res => res.data.data),

  getDistinctHttpMethods: () =>
    apiClient.get<ApiEnvelope<string[]>>('/super-admin/audit-logs/distinct/http-methods').then(res => res.data.data),

  getDistinctUsernames: () =>
    apiClient.get<ApiEnvelope<string[]>>('/super-admin/audit-logs/distinct/usernames').then(res => res.data.data),

  getDistinctIpAddresses: () =>
    apiClient.get<ApiEnvelope<string[]>>('/super-admin/audit-logs/distinct/ip-addresses').then(res => res.data.data),

  getDistinctTenants: () =>
    apiClient.get<ApiEnvelope<string[]>>('/super-admin/audit-logs/tenants').then(res => res.data.data)
};
