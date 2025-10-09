package com.afyaquik.hms.scheduling.api;

import com.afyaquik.hms.scheduling.domain.ShiftStatus;
import com.afyaquik.hms.scheduling.domain.ShiftType;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public record UpdateStaffShiftRequest(
	Long staffUserId,
	ShiftType shiftType,
	ShiftStatus status,

	@Size(max = 64)
	String roleKey,

	@Size(max = 64)
	String departmentId,

	OffsetDateTime startsAt,
	OffsetDateTime endsAt,

	@Size(max = 512)
	String notes,

	@Size(max = 512)
	String handoverNotes
) {
}
