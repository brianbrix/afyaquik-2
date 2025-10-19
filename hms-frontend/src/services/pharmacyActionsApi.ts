import { apiClient } from "./apiClient";

export interface PharmacyActionDto {
  id: number;
  title: string;
  details: string;
  category: string;
  isCustom?: boolean;
  sortOrder?: number;
  createdBy?: string;
  createdAt?: string;
}

export interface PharmacyActionRequest {
  title: string;
  details: string;
  category: string;
  isCustom?: boolean;
  sortOrder?: number;
  queueItemId?: number;
}

export interface BulkPharmacyActionRequest {
  actions: PharmacyActionRequest[];
}

export async function fetchPharmacyActions(queueItemId: number): Promise<PharmacyActionDto[]> {
  const res = await apiClient.get(`/queue/${queueItemId}/pharmacy-actions`);
  return res.data?.data ?? [];
}

export async function createPharmacyAction(queueItemId: number, action: Omit<PharmacyActionRequest, "queueItemId">): Promise<PharmacyActionDto> {
  const res = await apiClient.post(`/queue/${queueItemId}/pharmacy-actions`, action);
  return res.data?.data;
}

export async function updatePharmacyAction(queueItemId: number, id: number, action: Omit<PharmacyActionRequest, "queueItemId">): Promise<PharmacyActionDto> {
  const res = await apiClient.put(`/queue/${queueItemId}/pharmacy-actions/${id}`, action);
  return res.data?.data;
}

export async function deletePharmacyAction(queueItemId: number, id: number): Promise<void> {
  await apiClient.delete(`/queue/${queueItemId}/pharmacy-actions/${id}`);
}

export async function bulkUpsertPharmacyActions(queueItemId: number, actions: PharmacyActionRequest[]): Promise<PharmacyActionDto[]> {
  const res = await apiClient.post(`/queue/${queueItemId}/pharmacy-actions/bulk-upsert`, { actions });
  return res.data?.data ?? [];
}


