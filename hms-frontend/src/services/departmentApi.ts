import { apiClient } from './apiClient';
import { ApiEnvelope } from '../types/api';

export interface Department {
  id: number;
  departmentId: string;
  displayName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentRequest {
  departmentId: string;
  displayName: string;
  description?: string;
}

export interface UpdateDepartmentRequest {
  displayName: string;
  description?: string;
}

export const departmentApi = {
  // Get all departments
  getAll: () =>
    apiClient.get<ApiEnvelope<Department[]>>('/admin/departments').then(res => res.data.data),

  // Create department
  create: (data: CreateDepartmentRequest) =>
    apiClient.post<ApiEnvelope<Department>>('/admin/departments', data).then(res => res.data.data),

  // Update department
  update: (id: number, data: UpdateDepartmentRequest) =>
    apiClient.put<ApiEnvelope<Department>>(`/admin/departments/${id}`, data).then(res => res.data.data),

  // Delete department
  delete: (id: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/admin/departments/${id}`).then(res => res.data.data),
};
