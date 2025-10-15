package com.afyaquik.hms.scheduling.dto;

import com.afyaquik.hms.scheduling.domain.TimeOffStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReviewTimeOffRequestDto(
        @NotNull(message = "Status is required")
        TimeOffStatus status,

        @Size(max = 1000, message = "Review notes must not exceed 1000 characters")
        String reviewNotes
) {}
