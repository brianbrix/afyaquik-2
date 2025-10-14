export interface BulkConsultationEntryDto {
  id?: number;
  title: string;
  details: string;
}

export interface BulkConsultationEntryRequest {
  entries: BulkConsultationEntryDto[];
  ids?: number[];
}

export async function bulkUpsertConsultationEntries(queueItemId: number, entries: BulkConsultationEntryDto[]): Promise<ConsultationEntryDto[]> {
  const res = await apiClient.post(`/queue/${queueItemId}/consultation-entries/bulk-upsert`, { entries });
  return res.data?.data ?? [];
}

export async function bulkDeleteConsultationEntries(queueItemId: number, ids: number[]): Promise<void> {
  await apiClient.post(`/queue/${queueItemId}/consultation-entries/bulk-delete`, { ids });
}
import { apiClient } from "./apiClient";

export interface ConsultationEntryDto {
  id: number;
  title: string;
  details: string;
  createdBy?: string;
  createdAt?: string;
}

export interface ConsultationEntryRequest {
  title: string;
  details: string;
  queueItemId: number;
  createdBy?: string;
}

export async function fetchConsultationEntries(queueItemId: number): Promise<ConsultationEntryDto[]> {
  const res = await apiClient.get(`/queue/${queueItemId}/consultation-entries`);
  return res.data?.data ?? [];
}

export async function createConsultationEntry(queueItemId: number, entry: Omit<ConsultationEntryRequest, "queueItemId">): Promise<ConsultationEntryDto> {
  const res = await apiClient.post(`/queue/${queueItemId}/consultation-entries`, entry);
  return res.data?.data;
}

export async function updateConsultationEntry(queueItemId: number, id: number, entry: Omit<ConsultationEntryRequest, "queueItemId">): Promise<ConsultationEntryDto> {
  const res = await apiClient.put(`/queue/${queueItemId}/consultation-entries/${id}`, entry);
  return res.data?.data;
}

export async function deleteConsultationEntry(queueItemId: number, id: number): Promise<void> {
  await apiClient.delete(`/queue/${queueItemId}/consultation-entries/${id}`);
}
