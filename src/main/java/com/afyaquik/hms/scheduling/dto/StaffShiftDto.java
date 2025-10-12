package com.afyaquik.hms.scheduling.dto;

import com.afyaquik.hms.scheduling.domain.ShiftStatus;
import java.time.OffsetDateTime;

/**
 * Lightweight representation of a staff shift that can be shared across the service
 * and API layers without exposing the JPA entity.
 */
public record StaffShiftDto(
	Long id,
	Long staffUserId,
	String staffDisplayName,
	Long roleId,
	String roleName,
	Long departmentId,
	String departmentName,
	Long shiftTypeId,
	String shiftTypeName,
	ShiftStatus status,
	OffsetDateTime startsAt,
	OffsetDateTime endsAt,
	String notes,
	String handoverNotes
) {
}
