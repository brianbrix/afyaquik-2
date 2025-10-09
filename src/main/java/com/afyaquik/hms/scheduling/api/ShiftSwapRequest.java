package com.afyaquik.hms.scheduling.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ShiftSwapRequest(
        @NotBlank(message = "Swap request note is required")
        @Size(max = 512)
        String note
) {
}
