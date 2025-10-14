import { apiClient } from "./apiClient";

export interface TriageEntryDto {
  id: number;
  title: string;
  details: string;
  createdBy?: string;
  createdAt?: string;
}

export interface TriageEntryRequest {
  title: string;
  details: string;
  queueItemId: number;
  createdBy?: string;
}

export async function fetchTriageEntries(queueItemId: number): Promise<TriageEntryDto[]> {
  const res = await apiClient.get(`/queue/${queueItemId}/triage-entries`);
  return res.data?.data ?? [];
}

export async function createTriageEntry(queueItemId: number, entry: Omit<TriageEntryRequest, "queueItemId">): Promise<TriageEntryDto> {
  const res = await apiClient.post(`/queue/${queueItemId}/triage-entries`, entry);
  return res.data?.data;
}

export async function updateTriageEntry(queueItemId: number, id: number, entry: Omit<TriageEntryRequest, "queueItemId">): Promise<TriageEntryDto> {
  const res = await apiClient.put(`/queue/${queueItemId}/triage-entries/${id}`, entry);
  return res.data?.data;
}

export async function deleteTriageEntry(queueItemId: number, id: number): Promise<void> {
  await apiClient.delete(`/queue/${queueItemId}/triage-entries/${id}`);
}
