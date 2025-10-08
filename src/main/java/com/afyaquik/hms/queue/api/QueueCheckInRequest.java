package com.afyaquik.hms.queue.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record QueueCheckInRequest(
        @NotNull(message = "Patient id is required")
        Long patientId,

        @NotBlank(message = "Visit reason is required")
        @Size(max = 255)
        String visitReason,

        @Size(max = 16)
        String priority,

        @Size(max = 64)
        String departmentId
) {
}
