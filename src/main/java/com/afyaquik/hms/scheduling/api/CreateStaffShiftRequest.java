package com.afyaquik.hms.scheduling.api;

import com.afyaquik.hms.scheduling.domain.ShiftType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public record CreateStaffShiftRequest(
        @NotNull Long staffUserId,
        @NotBlank String departmentId,
        @NotBlank String roleKey,
        @NotNull ShiftType shiftType,
        @NotNull OffsetDateTime startsAt,
        @NotNull @Future OffsetDateTime endsAt,
        String notes) {
}
