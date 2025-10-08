import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignQueueItem,
  fetchQueueByStatus,
  fetchQueueTimeline,
  transitionQueueItem
} from "../../../services/queueApi";
import type {
  QueueAssignmentPayload,
  QueueTimelineEntry,
  QueueTransitionPayload,
  QueueStatus,
  QueueItem
} from "../../../types/queue";

const queueListKey = (status: QueueStatus) => ["queue", status];
const queueTimelineKey = (id: number) => ["queue", "timeline", id];

export function useQueueList(status: QueueStatus) {
  return useQuery({
    queryKey: queueListKey(status),
    queryFn: () => fetchQueueByStatus(status)
  });
}

export function useQueueTimeline(queueItemId: number | null) {
  return useQuery<QueueTimelineEntry[]>({
    queryKey: queueItemId ? queueTimelineKey(queueItemId) : ["queue", "timeline", "disabled"],
    queryFn: () => {
      if (!queueItemId) return Promise.resolve([]);
      return fetchQueueTimeline(queueItemId);
    },
    enabled: Boolean(queueItemId)
  });
}

export function useAssignQueueItem(status: QueueStatus) {
  const queryClient = useQueryClient();
  return useMutation<QueueItem, Error, { queueItemId: number; payload: QueueAssignmentPayload }>({
    mutationFn: ({ queueItemId, payload }) => assignQueueItem(queueItemId, payload),
    onSuccess: async (_data) => {
      await queryClient.invalidateQueries({ queryKey: queueListKey(status) });
    }
  });
}

export function useTransitionQueueItem(status: QueueStatus) {
  const queryClient = useQueryClient();
  return useMutation<QueueItem, Error, { queueItemId: number; payload: QueueTransitionPayload }>({
    mutationFn: ({ queueItemId, payload }) => transitionQueueItem(queueItemId, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queueListKey(status) }),
        queryClient.invalidateQueries({ queryKey: queueTimelineKey(variables.queueItemId) })
      ]);
    }
  });
}

