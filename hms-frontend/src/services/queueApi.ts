import { apiClient } from "./apiClient";
import type {
  QueueAssignmentPayload,
  QueueSummary,
  QueueTimelineEntry,
  QueueTransitionPayload,
  QueueStatus
} from "../types/queue";
import type { QueueItem } from "../types/queue";

export async function fetchQueueByStatus(status: QueueStatus): Promise<QueueSummary[]> {
  const response = await apiClient.get<QueueSummary[]>("/api/v1/queue", {
    params: { status }
  });
  return response.data;
}

export async function assignQueueItem(
  queueItemId: number,
  payload: QueueAssignmentPayload
): Promise<QueueItem> {
  const response = await apiClient.post<QueueItem>(`/api/v1/queue/${queueItemId}/assign`, payload);
  return response.data;
}

export async function transitionQueueItem(
  queueItemId: number,
  payload: QueueTransitionPayload
): Promise<QueueItem> {
  const response = await apiClient.post<QueueItem>(`/api/v1/queue/${queueItemId}/transition`, payload);
  return response.data;
}

export async function fetchQueueTimeline(queueItemId: number): Promise<QueueTimelineEntry[]> {
  const response = await apiClient.get<QueueTimelineEntry[]>(`/api/v1/queue/${queueItemId}/timeline`);
  return response.data;
}
