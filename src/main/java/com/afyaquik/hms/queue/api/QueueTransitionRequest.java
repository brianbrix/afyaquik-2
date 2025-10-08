package com.afyaquik.hms.queue.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record QueueTransitionRequest(
        @NotBlank(message = "Target status is required")
        @Size(max = 32)
        String targetStatus,

        @Size(max = 64)
        String actorId,

        @Size(max = 64)
        String actorRole,

        @Size(max = 128)
        String actorDisplayName,

        @Size(max = 512)
        String note,

        @Size(max = 64)
        String departmentId) {
}
