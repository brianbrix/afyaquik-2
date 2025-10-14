package com.afyaquik.hms.notification.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.notification.dto.NotificationDto;
import com.afyaquik.hms.notification.service.NotificationService;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    
    private final NotificationService notificationService;
    
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }
    
    /**
     * Get all notifications for the current user
     */
    @GetMapping
    public ApiResponse<List<NotificationDto>> getNotifications(Authentication authentication) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        String recipientId = authentication.getName(); // username
        List<NotificationDto> notifications = notificationService.getNotificationsForUser(tenantId, recipientId);
        return ApiResponse.success(notifications);
    }
    
    /**
     * Mark a specific notification as read
     */
    @PatchMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable Long id, Authentication authentication) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        String recipientId = authentication.getName();
        notificationService.markAsRead(tenantId, recipientId, id);
        return ApiResponse.success(null);
    }
    
    /**
     * Mark all notifications as read for the current user
     */
    @PatchMapping("/mark-all-read")
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
    public ApiResponse<Integer> getUnreadCount(Authentication authentication) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        String recipientId = authentication.getName();
        int count = notificationService.getUnreadCount(tenantId, recipientId);
        return ApiResponse.success(count);
    }
}
