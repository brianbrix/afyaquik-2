package com.afyaquik.hms.scheduling.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

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
	OffsetDateTime startsAt,

	@NotNull(message = "Shift end time is required")
	OffsetDateTime endsAt,

	@Size(max = 512)
	String notes
) {
}
