package com.afyaquik.hms.queue.dto;

import com.afyaquik.hms.queue.domain.QueueEventType;
import com.afyaquik.hms.queue.domain.QueueStatus;
import java.time.Instant;

public record QueueTimelineEntryResponse(
        Long id,
        QueueEventType eventType,
        QueueStatus fromStatus,
        QueueStatus toStatus,
        String actorId,
        String actorRole,
        String actorDisplayName,
        String note,
        String departmentId,
        Instant createdAt) {
}
