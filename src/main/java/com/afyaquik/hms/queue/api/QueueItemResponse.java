package com.afyaquik.hms.queue.api;

import com.afyaquik.hms.queue.domain.QueuePriority;
import com.afyaquik.hms.queue.domain.QueueStatus;
import java.time.Instant;

public record QueueItemResponse(
        Long id,
        Long patientId,
        String tenantId,
        String ticketNumber,
        String visitReason,
        QueueStatus status,
        QueueStatus previousStatus,
        QueuePriority priority,
        String currentAssigneeId,
        String departmentId,
        Instant createdAt,
        Instant slaDueAt) {
}
