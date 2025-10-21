package com.afyaquik.hms.notification.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.notification.service.QueueNotificationService;

@RestController
@RequestMapping("/api/v1/notifications")
public class QueueNotificationController {
    
    private final QueueNotificationService notificationService;

    public QueueNotificationController(QueueNotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Manually trigger waiting queue item notifications (for testing)
     */
    @PostMapping("/check-waiting")
    public ResponseEntity<String> checkWaitingQueueItems() {
        try {
            notificationService.checkWaitingQueueItems();
            return ResponseEntity.ok("Waiting queue items check completed");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Error checking waiting queue items: " + e.getMessage());
        }
    }



    /**
     * Request DTO for role-based notifications
     */
    public static class RoleNotificationRequest {
        private String templateCode;
        private String[] targetRoles;
        private String channel;
        private String message;

        // Getters and setters
        public String getTemplateCode() { return templateCode; }
        public void setTemplateCode(String templateCode) { this.templateCode = templateCode; }
        
        public String[] getTargetRoles() { return targetRoles; }
        public void setTargetRoles(String[] targetRoles) { this.targetRoles = targetRoles; }
        
        public String getChannel() { return channel; }
        public void setChannel(String channel) { this.channel = channel; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}