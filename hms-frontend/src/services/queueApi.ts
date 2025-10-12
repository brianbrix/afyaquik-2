
import { apiClient } from "./apiClient";
import type {
  QueueAssignmentPayload,
  QueueSummary,
  QueueTimelineEntry,
  QueueTransitionPayload,
  QueueStatus
} from "../types/queue";
import type { QueueItem } from "../types/queue";
import axios from 'axios';

// Generic API response envelope type (partial) for unwrapping
interface ApiResponse<T> { status?: string; data?: T; errors?: any; }

function unwrap<T>(payload: any): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiResponse<T>).data as T;
  }
  return payload as T;
}

export async function fetchQueueByStatus(status: QueueStatus): Promise<QueueSummary[]> {
  const response = await apiClient.get("/queue", { params: { status } });
  const unwrapped = unwrap<unknown>(response.data);
  return Array.isArray(unwrapped) ? (unwrapped as QueueSummary[]) : [];
}

export async function assignQueueItem(
  queueItemId: number,
  payload: QueueAssignmentPayload
): Promise<QueueItem> {
  const response = await apiClient.post(`/queue/${queueItemId}/assign`, payload);
  return unwrap<QueueItem>(response.data);
}

export async function transitionQueueItem(
  queueItemId: number,
  payload: QueueTransitionPayload
): Promise<QueueItem> {
  try {
    const response = await apiClient.post(`/queue/${queueItemId}/transition`, payload);
    return unwrap<QueueItem>(response.data);
  } catch (err) {
    throw normalizeApiError(err);
  }
}

export interface QueueAdvanceAssignPayload {
  targetStatus: QueueStatus;
  assigneeId: string;
  assigneeRole?: string;
  assigneeDisplayName?: string;
  departmentId?: string;
  note?: string;
}

// Enhanced error handling for advanceAssign
export async function advanceAssignQueueItem(
  queueItemId: number,
  payload: QueueAdvanceAssignPayload
): Promise<QueueItem> {
  try {
    const response = await apiClient.post(`/queue/${queueItemId}/advance-assign`, payload);
    return unwrap<QueueItem>(response.data);
  } catch (err) {
    throw normalizeApiError(err);
  }
}

// Update queue item (edit fields)
export async function updateQueueItem(
  queueItemId: number,
  payload: Partial<Pick<QueueItem, 'visitReason' | 'priority' | 'departmentId'>>
): Promise<QueueItem> {
  try {
    const response = await apiClient.put(`/queue/${queueItemId}`, payload);
    return unwrap<QueueItem>(response.data);
  } catch (err) {
    throw normalizeApiError(err);
  }
}



export async function fetchQueueTimeline(queueItemId: number): Promise<QueueTimelineEntry[]> {
  const response = await apiClient.get(`/queue/${queueItemId}/timeline`);
  const unwrapped = unwrap<unknown>(response.data);
  return Array.isArray(unwrapped) ? (unwrapped as QueueTimelineEntry[]) : [];
}

// Utility to unwrap ApiResponse.error
function normalizeApiError(err: any): Error {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;
    if (data && typeof data === 'object') {
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        return new Error(data.errors.map((e: any) => e.message || e).join('\n'));
      }
      if (data.status === 'ERROR' && data.data == null && data.message) {
        return new Error(data.message);
      }
    }
    return new Error(err.response?.data?.message || err.message || 'Request failed');
  }
  return err instanceof Error ? err : new Error('Unknown error');
}
