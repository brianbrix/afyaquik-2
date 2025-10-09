package com.afyaquik.hms.queue.api;

import jakarta.validation.constraints.NotBlank;

public record QueueAdvanceAssignRequest(
        @NotBlank String targetStatus,
        @NotBlank String assigneeId,
        String assigneeRole,
        String assigneeDisplayName,
        String departmentId,
        String note
) {}
