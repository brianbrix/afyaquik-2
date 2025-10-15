package com.afyaquik.hms.scheduling.dto;

import com.afyaquik.hms.scheduling.domain.TimeOffType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateTimeOffRequestDto(
        @NotNull(message = "User ID is required")
        Long userId,

        @NotNull(message = "Request type is required")
        TimeOffType requestType,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        @NotBlank(message = "Reason is required")
        @Size(max = 1000, message = "Reason must not exceed 1000 characters")
        String reason,

        @Size(max = 128, message = "Emergency contact must not exceed 128 characters")
        String emergencyContact,

        @Size(max = 32, message = "Emergency phone must not exceed 32 characters")
        String emergencyPhone
) {}
