package com.afyaquik.hms.config.websocket;

import com.afyaquik.hms.config.websocket.dto.QueueAssignMessage;
import com.afyaquik.hms.queue.api.QueueAssignmentRequest;
import com.afyaquik.hms.queue.service.QueueService;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

/**
 * Currently we only push server -> client. This controller is a placeholder for possible
 * future client-originated actions over STOMP (e.g. ack, subscribe filters). For now, we rely on
 * SimpleBroker and templates for broadcasting.
 */
@Controller
public class QueueWebSocketController {

    private final QueueService queueService;

    public QueueWebSocketController(QueueService queueService) {
        this.queueService = queueService;
    }

    // Example echo mapping (not used by frontend yet)
    @MessageMapping("/ping")
    @SendToUser("/queue/pong")
    public String ping() {
        return "pong";
    }

    // Direct broadcasting now handled by QueueEventPublisher via SimpMessagingTemplate.
    // This controller only handles inbound STOMP application destinations.

    @MessageMapping("/queue/assign")
    public void assign(@Payload QueueAssignMessage msg, @Header("X-Tenant-Id") String tenantId) {
        if (msg == null || msg.queueItemId() == null) {
            return;
        }
        QueueAssignmentRequest request = new QueueAssignmentRequest(
                msg.assigneeId(),
                msg.assigneeRole(),
                msg.assigneeDisplayName(),
                msg.departmentId(),
                msg.note()
        );
    queueService.assign(tenantId, msg.queueItemId(), request); // Broadcasting handled downstream
    }
}
