import { apiClient } from './apiClient';
import { ApiEnvelope } from './apiClient';

export interface UserProfile {
  id?: number;
  username: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber?: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  bio?: string;
  profileImageUrl?: string;
  department?: string;
  jobTitle?: string;
  employeeId?: string;
  hireDate?: string;
  supervisor?: string;
  workLocation?: string;
  workPhone?: string;
  workEmail?: string;
  lastLoginAt?: string;
  preferredLanguage?: string;
  timezone?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const profileApi = {
  // Get current user's profile
  getMe: () =>
    apiClient.get<ApiEnvelope<UserProfile>>('/profile/me').then(res => res.data.data),

  // Get all profiles (admin)
  getAll: () =>
    apiClient.get<ApiEnvelope<UserProfile[]>>('/profile').then(res => res.data.data),

  // Get profile by ID
  getById: (id: number) =>
    apiClient.get<ApiEnvelope<UserProfile>>(`/profile/${id}`).then(res => res.data.data),

  // Get profile by username
  getByUsername: (username: string) =>
    apiClient.get<ApiEnvelope<UserProfile>>(`/profile/username/${username}`).then(res => res.data.data),

  // Get profiles by department
  getByDepartment: (department: string) =>
    apiClient.get<ApiEnvelope<UserProfile[]>>(`/profile/department/${department}`).then(res => res.data.data),

  // Get distinct departments
  getDepartments: () =>
    apiClient.get<ApiEnvelope<string[]>>('/profile/departments').then(res => res.data.data),

  // Create profile
  create: (profile: Partial<UserProfile>) =>
    apiClient.post<ApiEnvelope<UserProfile>>('/profile', profile).then(res => res.data.data),

  // Update current user's profile
  updateCurrent: (profile: Partial<UserProfile>) =>
    apiClient.put<ApiEnvelope<UserProfile>>('/profile/me', profile).then(res => res.data.data),

  // Update profile (alias for updateCurrent)
  updateProfile: (profile: Partial<UserProfile>) =>
    apiClient.put<ApiEnvelope<UserProfile>>('/profile/me', profile).then(res => res.data.data),

  // Update profile by ID (admin)
  update: (id: number, profile: Partial<UserProfile>) =>
    apiClient.put<ApiEnvelope<UserProfile>>(`/profile/${id}`, profile).then(res => res.data.data),

  // Delete profile
  delete: (id: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/profile/${id}`).then(res => res.data.data),

  // Update last login
  updateLastLogin: () =>
    apiClient.put<ApiEnvelope<void>>('/profile/me/last-login', {}).then(res => res.data.data),

  // Create profile from user data (admin)
  createFromUser: (userData: { username: string; email: string; firstName: string; lastName: string }) =>
    apiClient.post<ApiEnvelope<UserProfile>>('/profile/create-from-user', userData).then(res => res.data.data),

  // Check if profile exists
  checkExists: (username: string) =>
    apiClient.get<ApiEnvelope<boolean>>(`/profile/exists/${username}`).then(res => res.data.data)
};
