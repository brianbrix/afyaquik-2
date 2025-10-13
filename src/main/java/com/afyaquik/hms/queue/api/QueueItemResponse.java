package com.afyaquik.hms.queue.api;

import com.afyaquik.hms.queue.domain.QueuePriority;
import com.afyaquik.hms.queue.domain.QueueStatus;
import java.time.Instant;
import java.util.List;

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
        Instant slaDueAt,
        String additionalDetails,
        List<Long> insuranceDetailsIds

) {
}
