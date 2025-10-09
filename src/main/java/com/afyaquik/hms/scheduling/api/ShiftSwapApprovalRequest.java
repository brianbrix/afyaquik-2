package com.afyaquik.hms.scheduling.api;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ShiftSwapApprovalRequest(
        @NotNull(message = "Replacement staff user id is required")
        Long targetStaffUserId,

        @Size(max = 512)
        String note,

        @Size(max = 512)
        String handoverNotes
) {
}
