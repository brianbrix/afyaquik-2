package com.afyaquik.hms.notification.repository;

import java.util.List;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.afyaquik.hms.notification.domain.Notification;

public interface NotificationRepository extends TenantAwareRepository<Notification, Long> {
    
    /**
     * Find all notifications for a specific tenant and recipient, ordered by sent date (newest first)
     */
    List<Notification> findByTenantIdAndRecipientIdOrderBySentAtDesc(String tenantId, String recipientId);
    
    /**
     * Find all unread notifications for a specific tenant and recipient
     */
    List<Notification> findByTenantIdAndRecipientIdAndReadFalse(String tenantId, String recipientId);
    
    /**
     * Count unread notifications for a specific tenant and recipient
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.tenantId = :tenantId AND n.recipientId = :recipientId AND n.read = false")
    int countByTenantIdAndRecipientIdAndReadFalse(@Param("tenantId") String tenantId, @Param("recipientId") String recipientId);
    
    // Tenant-aware default methods
    default List<Notification> findByRecipientIdForCurrentTenant(String recipientId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndRecipientIdOrderBySentAtDesc(tenantId, recipientId);
    }
    
    default List<Notification> findUnreadByRecipientIdForCurrentTenant(String recipientId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndRecipientIdAndReadFalse(tenantId, recipientId);
    }
    
    default int countUnreadByRecipientIdForCurrentTenant(String recipientId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return countByTenantIdAndRecipientIdAndReadFalse(tenantId, recipientId);
    }
}
