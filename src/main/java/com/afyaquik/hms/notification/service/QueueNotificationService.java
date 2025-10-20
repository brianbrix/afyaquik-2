package com.afyaquik.hms.notification.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.queue.domain.VisitQueueItem;
import com.afyaquik.hms.queue.repository.VisitQueueItemRepository;
import com.afyaquik.hms.settings.service.SystemSettingsService;

@Service
public class QueueNotificationService {
    private final Logger log = org.slf4j.LoggerFactory.getLogger(QueueNotificationService.class);
    private final VisitQueueItemRepository queueItemRepository;
    private final StaffUserRepository staffUserRepository;
    private final SystemSettingsService systemSettingsService;
    private final NotificationService notificationService;

    public QueueNotificationService(VisitQueueItemRepository queueItemRepository, StaffUserRepository staffUserRepository, SystemSettingsService systemSettingsService, NotificationService notificationService) {
        this.queueItemRepository = queueItemRepository;
        this.staffUserRepository = staffUserRepository;
        this.systemSettingsService = systemSettingsService;
        this.notificationService = notificationService;
    }

    /**
     * Check for queue items that have been waiting for the configured threshold and send notifications
     * Runs every 5 minutes
     */
    @Scheduled(fixedRate = 300000) // 5 minutes in milliseconds
    @Transactional(readOnly = true)
    public void checkWaitingQueueItems() {
        log.debug("Checking for waiting queue items...");

        // Get configurable threshold from system settings
        int thresholdMinutes = systemSettingsService.getQueueWaitingThresholdMinutes();
        Instant thresholdTime = Instant.now().minus(thresholdMinutes, ChronoUnit.MINUTES);
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();

        // Find queue items that have been in waiting status for the configured threshold
        List<VisitQueueItem> waitingItems = queueItemRepository.findWaitingItemsForNotification(tenantId, thresholdTime);

        log.info("Found {} queue items waiting for {} minutes or more", waitingItems.size(), thresholdMinutes);

        for (VisitQueueItem item : waitingItems) {
            try {
                sendWaitingNotification(item);
            } catch (Exception e) {
                log.error("Error processing waiting queue item notification for item {}: {}", item.getId(), e.getMessage(), e);
            }
        }
    }

    /**
     * Send waiting notification for a specific queue item
     */
    @Transactional
    public void sendWaitingNotification(VisitQueueItem item) {
        if (item.getCurrentAssigneeId() == null) {
            log.warn("Queue item {} has no assignee, skipping notification", item.getId());
            return;
        }

        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        if (tenantId == null) {
            log.warn("No tenant context available, skipping notification for queue item {}", item.getId());
            return;
        }

        // Get assigned staff member
        StaffUser assignedStaff = staffUserRepository.findByTenantIdAndUsername(tenantId, item.getCurrentAssigneeId()).orElse(null);
        if (assignedStaff == null) {
            log.warn("Assigned staff not found for queue item {}", item.getId());
            return;
        }

        if (!assignedStaff.isEnabled()) {
            log.warn("Assigned staff {} is disabled, skipping notification for queue item {}", assignedStaff.getUsername(), item.getId());
            return;
        }

        // Calculate waiting time
        LocalDateTime statusChangedAt = item.getUpdatedAt() != null ? item.getUpdatedAt().atZone(ZoneId.systemDefault()).toLocalDateTime() : item.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDateTime();
        long waitingMinutes = ChronoUnit.MINUTES.between(statusChangedAt, LocalDateTime.now());

        // Prepare notification variables
        Map<String, Object> variables = new HashMap<>();
        variables.put("patientName", item.getPatient().getFirstName() + " " + item.getPatient().getLastName());
        variables.put("ticketNumber", item.getTicketNumber());
        variables.put("waitingTime", waitingMinutes);
        variables.put("status", item.getCurrentStatus().name());

        // Send notification to the assigned staff member
        notificationService.sendNotification(
                "QUEUE_WAITING_ALERT",
                variables,
                assignedStaff.getUsername(),
                "IN_APP"
        );

        log.info("Sent waiting notification to {} for queue item {} (waiting {} minutes)",
                assignedStaff.getUsername(), item.getId(), waitingMinutes);
    }

    /**
     * Manual trigger to check waiting items (for testing)
     */
    @Transactional(readOnly = true)
    public void checkWaitingItemsManually() {
        log.info("Manually checking for waiting queue items...");
        checkWaitingQueueItems();
    }
}
