package com.afyaquik.hms.scheduling.api;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateStaffShiftRequest(
	@NotNull(message = "Staff user id is required")
	Long staffUserId,

	@NotNull(message = "Role id is required")
	Long roleId,

	@NotNull(message = "Department id is required")
	Long departmentId,

	@NotNull(message = "Shift type is required")
	Long shiftTypeId,

	@NotNull(message = "Shift start time is required")
	LocalDateTime startsAt,

	@NotNull(message = "Shift end time is required")
	LocalDateTime endsAt,

	@Size(max = 512)
	String notes,

	boolean isRecurring
) {
}
