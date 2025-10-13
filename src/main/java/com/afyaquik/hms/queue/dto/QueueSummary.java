package com.afyaquik.hms.queue.dto;

import com.afyaquik.hms.queue.domain.QueuePriority;
import com.afyaquik.hms.queue.domain.QueueStatus;
import java.time.Instant;

import java.util.Set;

public record QueueSummary(
        Long id,
        String ticketNumber,
        String patientName,
        Long patientId,
        String visitReason,
        QueueStatus status,
        QueuePriority priority,
        String currentAssigneeId,
        String currentAssigneeUsername,
        String departmentId,
        Instant createdAt,
        Instant slaDueAt,
        Set<Long> insuranceDetailsIds,
        String additionalDetails
) {}
