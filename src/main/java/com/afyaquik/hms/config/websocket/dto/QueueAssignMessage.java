package com.afyaquik.hms.config.websocket.dto;

/**
 * Payload for STOMP /app/queue/assign messages.
 */
public record QueueAssignMessage(Long queueItemId,
                                 String assigneeId,
                                 String assigneeRole,
                                 String assigneeDisplayName,
                                 String departmentId,
                                 String note) {
}
