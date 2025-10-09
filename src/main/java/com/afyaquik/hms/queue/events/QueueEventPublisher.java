package com.afyaquik.hms.queue.events;

import com.afyaquik.hms.queue.api.QueueItemResponse;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Publishes queue item updates over WebSocket (STOMP topics). SSE support removed.
 */
@Component
public class QueueEventPublisher {
    private static final Logger log = LoggerFactory.getLogger(QueueEventPublisher.class);
    private final SimpMessagingTemplate messagingTemplate;

    public QueueEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publish(QueueItemResponse payload) {
        if (payload == null || payload.tenantId() == null) {
            log.debug("Skipping websocket broadcast - null payload or tenantId");
            return;
        }
        try {
            messagingTemplate.convertAndSend("/topic/queue." + payload.tenantId(), payload);
        } catch (Exception e) {
            log.warn("Failed to broadcast over websocket: {}", e.getMessage());
        }
    }
}
