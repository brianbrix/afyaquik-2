package com.afyaquik.hms.notification.events;

import com.afyaquik.hms.notification.domain.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventPublisher {
    private static final Logger log = LoggerFactory.getLogger(NotificationEventPublisher.class);
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publish(Notification notification) {
        if (notification == null || notification.getTenantId() == null || notification.getRecipientId() == null) {
            log.debug("Skipping websocket notification broadcast - null payload, tenantId, or recipientId");
            return;
        }
        try {
            // Topic: /topic/notifications.{tenantId}.{recipientId}
            String topic = "/topic/notifications." + notification.getTenantId() + "." + notification.getRecipientId();
            messagingTemplate.convertAndSend(topic, notification);
        } catch (Exception e) {
            log.warn("Failed to broadcast notification over websocket: {}", e.getMessage());
        }
    }
}
