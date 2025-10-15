import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchQueueByStatus, fetchQueueTimeline, transitionQueueItem, advanceAssignQueueItem, assignQueueItem } from "../../../services/queueApi";
import type {
  QueueAssignmentPayload,
  QueueTimelineEntry,
  QueueTransitionPayload,
  QueueStatus,
  QueueItem,
  QueueAdvanceAssignPayload
} from "../../../types/queue";
import { useAuth } from "../../../hooks/useAuth";
import { Client, IMessage, StompSubscription, StompConfig } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const queueListKey = (status: QueueStatus) => ["queue", status];
const queueTimelineKey = (id: number) => ["queue", "timeline", id];

export function useQueueList(status: QueueStatus, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [...queueListKey(status), startDate, endDate],
    queryFn: () => fetchQueueByStatus(status, startDate, endDate)
  });
}

export function useQueueListByRole(allowedStatuses: QueueStatus[], startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["queue", "role-based", allowedStatuses, startDate, endDate],
    queryFn: async () => {
      // Fetch queue items for all allowed statuses
      const promises = allowedStatuses.map(status => fetchQueueByStatus(status, startDate, endDate));
      const results = await Promise.all(promises);
      // Flatten and return all items
      return results.flat();
    },
    enabled: allowedStatuses.length > 0
  });
}

export function useQueueStream(status: QueueStatus) {
  const queryClient = useQueryClient();
  const { isAuthenticated, ensureFreshAccessToken, tenantId } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    let client: Client | null = null;
    let subscription: StompSubscription | null = null;
    let cancelled = false;

    const topic = `/topic/queue.${tenantId}`; // partitioned by tenant

    const applyMessage = (body: string) => {
      try {
        const data = JSON.parse(body) as QueueItem;
        queryClient.setQueryData<QueueItem[] | undefined>(["queue", status], (old) => {
          if (!old) return old;
          const idxItem = old.findIndex(i => i.id === data.id);
          if (idxItem === -1) {
            return data.status === status ? [data, ...old] : old;
          }
          const updated = [...old];
          if (data.status === status) {
            updated[idxItem] = data;
            return updated;
          }
          updated.splice(idxItem, 1);
          return updated;
        });
      } catch { /* ignore */ }
    };

    const connect = async () => {
      const token = await ensureFreshAccessToken();
      if (!token || cancelled) return;

      client = new Client({
        // Use SockJS factory because backend endpoint registered with SockJS
        webSocketFactory: () => new SockJS(`http://localhost:8080/ws`),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-Id': tenantId
        },
        debug: () => {},
        reconnectDelay: 0, // we'll manage backoff manually
        heartbeatIncoming: 10000, // expect server heartbeats every 10s
        heartbeatOutgoing: 10000
      } as Partial<StompConfig> as Client);

      let attempt = 0;

      const scheduleReconnect = () => {
        if (cancelled) return;
        attempt += 1;
        // exponential backoff with jitter, max 30s
        const base = Math.min(30000, Math.pow(2, attempt) * 500);
        const delay = base + Math.random() * 300;
        setTimeout(() => {
          if (!cancelled) client?.activate();
        }, delay);
      };

      client.onConnect = () => {
        attempt = 0; // reset on success
        subscription = client!.subscribe(topic, (msg: IMessage) => applyMessage(msg.body));
      };

      client.onStompError = () => {
        subscription?.unsubscribe();
        scheduleReconnect();
      };

      client.onWebSocketClose = () => {
        subscription?.unsubscribe();
        scheduleReconnect();
      };

      client.onWebSocketError = () => {
        subscription?.unsubscribe();
        scheduleReconnect();
      };

      client.activate();
    };

    connect();

    return () => {
      cancelled = true;
      try { subscription?.unsubscribe(); } catch { /* noop */ }
      if (client) {
        try { client.deactivate(); } catch { /* noop */ }
      }
    };
  }, [isAuthenticated, ensureFreshAccessToken, tenantId, queryClient, status]);
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queueListKey(status) }),
        // Also invalidate role-based queries to ensure UI updates immediately
        queryClient.invalidateQueries({ queryKey: ["queue", "role-based"] })
      ]);
    }
  });
}

export function useTransitionQueueItem(status: QueueStatus) {
  const queryClient = useQueryClient();
  return useMutation<QueueItem, Error, { queueItemId: number; payload: QueueTransitionPayload }>({
    mutationFn: ({ queueItemId, payload }) => transitionQueueItem(queueItemId, payload),
    onMutate: async ({ queueItemId, payload }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["queue", "role-based"] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["queue", "role-based"]);
      
      // Optimistically update the cache
      queryClient.setQueryData(["queue", "role-based"], (old: any) => {
        if (!old) return old;
        return old.map((item: any) => 
          item.id === queueItemId 
            ? { ...item, status: payload.targetStatus }
            : item
        );
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context && typeof context === 'object' && 'previousData' in context) {
        queryClient.setQueryData(["queue", "role-based"], (context as any).previousData);
      }
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queueListKey(status) }),
        queryClient.invalidateQueries({ queryKey: queueTimelineKey(variables.queueItemId) }),
        // Also invalidate role-based queries to ensure UI updates immediately
        queryClient.invalidateQueries({ queryKey: ["queue", "role-based"] })
      ]);
    }
  });
}

export function useAdvanceAssignQueueItem(status: QueueStatus) {
  const qc = useQueryClient();
  return useMutation<QueueItem, Error, { queueItemId: number; payload: QueueAdvanceAssignPayload }>({
    mutationFn: ({ queueItemId, payload }) => advanceAssignQueueItem(queueItemId, payload),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: queueListKey(status) }),
        // Also invalidate role-based queries to ensure UI updates immediately
        qc.invalidateQueries({ queryKey: ["queue", "role-based"] })
      ]);
    }
  });
}

