package com.afyaquik.hms.scheduling.api;

import java.time.LocalDateTime;

import com.afyaquik.hms.scheduling.domain.ShiftStatus;

import jakarta.validation.constraints.Size;

public record UpdateStaffShiftRequest(
	Long staffUserId,
	Long shiftTypeId,
	ShiftStatus status,

	Long roleId,
	Long departmentId,

	LocalDateTime startsAt,
	LocalDateTime endsAt,

	@Size(max = 512)
	String notes,

	@Size(max = 512)
	String handoverNotes,

	Boolean isRecurring
) {
}
