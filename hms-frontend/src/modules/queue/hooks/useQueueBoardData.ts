import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "../../../services/apiClient";
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

export function useQueueList(status: QueueStatus) {
  return useQuery({
    queryKey: queueListKey(status),
    queryFn: () => fetchQueueByStatus(status)
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

export function useAdvanceAssignQueueItem(status: QueueStatus) {
  const qc = useQueryClient();
  return useMutation<QueueItem, Error, { queueItemId: number; payload: QueueAdvanceAssignPayload }>({
    mutationFn: ({ queueItemId, payload }) => advanceAssignQueueItem(queueItemId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queueListKey(status) })
  });
}

