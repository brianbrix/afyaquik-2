package com.afyaquik.hms.notification.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.audit.annotation.Auditable;
import com.afyaquik.hms.auth.security.TenantUserDetails;
import com.afyaquik.hms.auth.service.ActiveRoleService;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.notification.dto.NotificationDto;
import com.afyaquik.hms.notification.service.NotificationService;

@RestController
@RequestMapping("/api/v1/notifications")
@Auditable(entityType = "Notification", auditGet = false, description = "Notification management operations")
public class NotificationController {
    
    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);
    private final NotificationService notificationService;
    private final ActiveRoleService activeRoleService;
    
    public NotificationController(NotificationService notificationService, ActiveRoleService activeRoleService) {
        this.notificationService = notificationService;
        this.activeRoleService = activeRoleService;
    }
    
    /**
     * Get all notifications for the current user filtered by active role
     */
    @GetMapping
    public ApiResponse<List<NotificationDto>> getNotifications(Authentication authentication) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        String recipientId = authentication.getName(); // username
        
        // Get active role for filtering
        TenantUserDetails principal = (TenantUserDetails) authentication.getPrincipal();
        String userId = principal.getUser().getId().toString();
        String activeRole = activeRoleService.getActiveRole(tenantId, userId).orElse(null);
        
        log.debug("Fetching notifications for user: {}, tenant: {}, activeRole: {}", recipientId, tenantId, activeRole);
        
        List<NotificationDto> notifications;
        if (activeRole != null) {
            notifications = notificationService.getNotificationsForUserByRole(tenantId, recipientId, activeRole);
            log.debug("Found {} notifications for user {} with active role {}", notifications.size(), recipientId, activeRole);
        } else {
            notifications = notificationService.getNotificationsForUser(tenantId, recipientId);
            log.debug("Found {} notifications for user {} (no active role filtering)", notifications.size(), recipientId);
        }
        
        return ApiResponse.success(notifications);
    }
    
    /**
     * Mark a specific notification as read
     */
    @PatchMapping("/{id}/read")
    @Auditable(action = "MARK_NOTIFICATION_READ", entityType = "Notification", entityIdField = "id", description = "Mark notification as read")
    public ApiResponse<Void> markAsRead(@PathVariable Long id, Authentication authentication) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        String recipientId = authentication.getName();
        notificationService.markAsRead(tenantId, recipientId, id);
        return ApiResponse.success(null);
    }
    
    /**
     * Test endpoint to create sample notifications for testing role filtering
     */
    @PostMapping("/test-role-filtering")
    @Auditable(action = "CREATE_TEST_NOTIFICATIONS", entityType = "Notification", description = "Create test notifications for role filtering")
    public ApiResponse<String> testRoleFiltering(Authentication authentication) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        String recipientId = authentication.getName();
        
        // Create test notifications for different roles
        notificationService.sendNotification("DOCTOR_SPECIFIC", 
            java.util.Map.of("message", "Test doctor notification"), 
            recipientId, "IN_APP");
            
        notificationService.sendNotification("NURSE_SPECIFIC", 
            java.util.Map.of("message", "Test nurse notification"), 
            recipientId, "IN_APP");
            
        notificationService.sendNotification("LOW_STOCK_ALERT", 
            java.util.Map.of("medicationName", "Test Medication", "currentStock", "5", "minimumRequired", "10", "shortage", "5"), 
            recipientId, "IN_APP");
        
        return ApiResponse.success("Test notifications created for role filtering");
    }
    
    /**
     * Mark all notifications as read for the current user
     */
    @PatchMapping("/mark-all-read")
    @Auditable(action = "MARK_ALL_NOTIFICATIONS_READ", entityType = "Notification", description = "Mark all notifications as read")
    public ApiResponse<Void> markAllAsRead(Authentication authentication) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        String recipientId = authentication.getName();
        notificationService.markAllAsRead(tenantId, recipientId);
        return ApiResponse.success(null);
    }
    
    /**
     * Get unread notification count for the current user
     */
    @GetMapping("/unread-count")
    @Auditable(action = "GET_UNREAD_COUNT", entityType = "Notification", auditGet = true, description = "Get unread notification count")
    public ApiResponse<Integer> getUnreadCount(Authentication authentication) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        String recipientId = authentication.getName();
        int count = notificationService.getUnreadCount(tenantId, recipientId);
        return ApiResponse.success(count);
    }
}
