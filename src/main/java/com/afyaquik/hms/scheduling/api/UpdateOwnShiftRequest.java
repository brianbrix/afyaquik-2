package com.afyaquik.hms.scheduling.api;

import com.afyaquik.hms.scheduling.domain.ShiftStatus;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for shift owner PATCH update (status, notes only).
 */
public record UpdateOwnShiftRequest(
    @NotNull(message = "Status is required")
    ShiftStatus status,

    @Size(max = 512)
    String notes
) {}
