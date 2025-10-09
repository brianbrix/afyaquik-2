package com.afyaquik.hms.scheduling.api;

import com.afyaquik.hms.scheduling.domain.ShiftType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public record CreateStaffShiftRequest(
	@NotNull(message = "Staff user id is required")
	Long staffUserId,

	@NotBlank(message = "Role key is required")
	@Size(max = 64)
	String roleKey,

	@NotBlank(message = "Department id is required")
	@Size(max = 64)
	String departmentId,

	@NotNull(message = "Shift type is required")
	ShiftType shiftType,

	@NotNull(message = "Shift start time is required")
	OffsetDateTime startsAt,

	@NotNull(message = "Shift end time is required")
	OffsetDateTime endsAt,

	@Size(max = 512)
	String notes
) {
}
