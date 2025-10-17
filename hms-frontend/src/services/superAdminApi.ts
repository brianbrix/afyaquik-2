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

export const superAdminApi = {
  // Super Admin Authentication
  login: (credentials: SuperAdminLoginRequest) =>
    apiClient.post<ApiEnvelope<SuperAdminLoginResponse>>('/super-admin/auth/login', credentials).then(res => res.data.data),

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
    apiClient.get<ApiEnvelope<boolean>>('/super-admin/check-access').then(res => res.data.data)
};
