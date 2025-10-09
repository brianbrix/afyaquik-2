package com.afyaquik.hms.scheduling.api;

import com.afyaquik.hms.scheduling.domain.ShiftStatus;
import com.afyaquik.hms.scheduling.domain.ShiftType;
import java.time.OffsetDateTime;

public record StaffShiftResponse(
	Long id,
	Long staffUserId,
	String staffDisplayName,
	String roleKey,
	String departmentId,
	ShiftType shiftType,
	ShiftStatus status,
	OffsetDateTime startsAt,
	OffsetDateTime endsAt,
	String notes,
	String handoverNotes
) {
}
