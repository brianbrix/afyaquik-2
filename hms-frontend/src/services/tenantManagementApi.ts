import { apiClient } from './apiClient';
import { ApiEnvelope } from './apiClient';

export interface Tenant {
  id: number;
  tenantCode: string;
  tenantName: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  isActive: boolean;
  subscriptionPlan?: string;
  maxUsers?: number;
  trialEndsAt?: string;
  settings?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantStats {
  tenantName: string;
  tenantCode: string;
  totalUsers: number;
  activeUsers: number;
  maxUsers?: number;
  isActive: boolean;
  trialEndsAt?: string;
}

export interface CreateTenantRequest {
  tenantCode: string;
  tenantName: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  subscriptionPlan?: string;
  maxUsers?: number;
  trialDays?: number;
}

export interface CreateAdminUserRequest {
  username: string;
  displayName: string;
  email: string;
  password: string;
  tenantCode: string;
  roleKey: string;
  department?: string;
  phone?: string;
  notes?: string;
}

export interface StaffUser {
  id: number;
  tenantId: string;
  username: string;
  displayName: string;
  email: string;
  department?: string;
  phone?: string;
  jobTitle?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const tenantManagementApi = {
  // Get all tenants
  getAllTenants: () =>
    apiClient.get<ApiEnvelope<Tenant[]>>('/super-admin/tenants').then(res => res.data.data),

  // Get active tenants
  getActiveTenants: () =>
    apiClient.get<ApiEnvelope<Tenant[]>>('/super-admin/tenants/active').then(res => res.data.data),

  // Get tenant by code
  getTenant: (tenantCode: string) =>
    apiClient.get<ApiEnvelope<Tenant>>(`/super-admin/tenants/${tenantCode}`).then(res => res.data.data),

  // Create tenant
  createTenant: (tenant: CreateTenantRequest) =>
    apiClient.post<ApiEnvelope<Tenant>>('/super-admin/tenants', tenant).then(res => res.data.data),

  // Update tenant
  updateTenant: (tenantCode: string, tenant: CreateTenantRequest) =>
    apiClient.put<ApiEnvelope<Tenant>>(`/super-admin/tenants/${tenantCode}`, tenant).then(res => res.data.data),

  // Deactivate tenant
  deactivateTenant: (tenantCode: string) =>
    apiClient.delete<ApiEnvelope<void>>(`/super-admin/tenants/${tenantCode}`).then(res => res.data.data),

  // Get tenant stats
  getTenantStats: (tenantCode: string) =>
    apiClient.get<ApiEnvelope<TenantStats>>(`/super-admin/tenants/${tenantCode}/stats`).then(res => res.data.data),

  // Get tenant users
  getTenantUsers: (tenantCode: string) =>
    apiClient.get<ApiEnvelope<StaffUser[]>>(`/super-admin/tenants/${tenantCode}/users`).then(res => res.data.data),

  // Create admin user for tenant
  createAdminUser: (tenantCode: string, user: CreateAdminUserRequest) =>
    apiClient.post<ApiEnvelope<StaffUser>>(`/super-admin/tenants/${tenantCode}/admin-users`, user).then(res => res.data.data)
};
