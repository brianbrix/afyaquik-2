package com.afyaquik.hms.queue.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record QueueAssignmentRequest(
        @NotBlank(message = "Assignee id is required")
        @Size(max = 64)
        String assigneeId,

        @Size(max = 128)
        String assigneeDisplayName,

        @Size(max = 64)
        String assigneeRole,

        @Size(max = 64)
        String departmentId,

        @Size(max = 512)
        String note) {
}
