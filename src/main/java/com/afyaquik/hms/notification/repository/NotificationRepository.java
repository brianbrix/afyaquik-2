package com.afyaquik.hms.notification.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.afyaquik.hms.notification.domain.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
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
}
