package com.afyaquik.hms.scheduling.dto;

import com.afyaquik.hms.scheduling.domain.ShiftStatus;
import com.afyaquik.hms.scheduling.domain.ShiftType;
import java.time.OffsetDateTime;

/**
 * Lightweight representation of a staff shift that can be shared across the service
 * and API layers without exposing the JPA entity.
 */
public record StaffShiftDto(
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
