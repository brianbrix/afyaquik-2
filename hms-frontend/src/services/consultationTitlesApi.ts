import { apiClient } from './apiClient';
import { ApiEnvelope } from './apiClient';

export interface ConsultationTitle {
  id?: number;
  title: string;
  level: number;
  sortOrder: number;
  isCustom: boolean;
  parentId?: number;
  parentTitle?: string;
  children?: ConsultationTitle[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ConsultationTitleRequest {
  title: string;
  level: number;
  sortOrder?: number;
  isCustom?: boolean;
  parentId?: number;
}

export const consultationTitlesApi = {
  // Get all consultation titles
  getAll: () =>
    apiClient.get<ApiEnvelope<ConsultationTitle[]>>('/admin/consultation-titles').then(res => res.data.data),

  // Get root level titles (level 1)
  getRootTitles: () =>
    apiClient.get<ApiEnvelope<ConsultationTitle[]>>('/admin/consultation-titles/root').then(res => res.data.data),

  // Get children of a specific parent
  getChildren: (parentId: number) =>
    apiClient.get<ApiEnvelope<ConsultationTitle[]>>(`/admin/consultation-titles/children/${parentId}`).then(res => res.data.data),

  // Get titles by level
  getByLevel: (level: number) =>
    apiClient.get<ApiEnvelope<ConsultationTitle[]>>(`/admin/consultation-titles/level/${level}`).then(res => res.data.data),

  // Get parent candidates (titles that can have children)
  getParentCandidates: () =>
    apiClient.get<ApiEnvelope<ConsultationTitle[]>>('/admin/consultation-titles/parent-candidates').then(res => res.data.data),

  // Get consultation title by ID
  getById: (id: number) =>
    apiClient.get<ApiEnvelope<ConsultationTitle>>(`/admin/consultation-titles/${id}`).then(res => res.data.data),

  // Create consultation title
  create: (title: ConsultationTitleRequest) =>
    apiClient.post<ApiEnvelope<ConsultationTitle>>('/admin/consultation-titles', title).then(res => res.data.data),

  // Update consultation title
  update: (id: number, title: ConsultationTitleRequest) =>
    apiClient.put<ApiEnvelope<ConsultationTitle>>(`/admin/consultation-titles/${id}`, title).then(res => res.data.data),

  // Delete consultation title
  delete: (id: number) =>
    apiClient.delete<ApiEnvelope<void>>(`/admin/consultation-titles/${id}`).then(res => res.data.data)
};