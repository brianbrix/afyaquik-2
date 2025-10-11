import { apiClient } from "./apiClient";
import type { QueueItem, QueueStatus, QueuePriority } from "../types/queue";

export interface CreateQueuePayload {
  patientId: number;
  visitReason: string;
  priority: QueuePriority;
}

export async function createQueueForPatient(payload: CreateQueuePayload): Promise<QueueItem> {
  const res = await apiClient.post(`/api/v1/queue`, payload);
  return res.data?.data ?? res.data;
}

export async function fetchPatientQueue(patientId: number): Promise<QueueItem[]> {
  const res = await apiClient.get(`/api/v1/queue`, { params: { patientId } });
  return res.data?.data ?? res.data;
}
