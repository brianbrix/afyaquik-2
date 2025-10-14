
package com.afyaquik.hms.scheduling.domain;

import java.time.OffsetDateTime;
import java.time.ZoneId;

import com.afyaquik.hms.auth.domain.Department;
import com.afyaquik.hms.auth.domain.StaffRole;
import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.common.domain.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Represents a single staff shift on a tenant's rota. Shifts track the owning
 * staff member, department/role metadata, timeframe, and current lifecycle
 * status. The entity extends {@link BaseEntity} to inherit tenant scoping and
 * audit timestamps.
 */
@Entity
@Table(name = "staff_shifts")
public class StaffShift extends BaseEntity {

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "staff_user_id", nullable = false)
	private StaffUser staffUser;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "role_id", nullable = false)
	private StaffRole role;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "department_id", nullable = false)
	private Department department;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "shift_type_id", nullable = false)
	private ShiftType shiftType;

	@Enumerated(jakarta.persistence.EnumType.ORDINAL)
	@Column(name = "status", nullable = false, length = 32)
	private ShiftStatus status = ShiftStatus.SCHEDULED;

	@Column(name = "starts_at", nullable = false)
	private OffsetDateTime startsAt;

	@Column(name = "ends_at", nullable = false)
	private OffsetDateTime endsAt;

	@Column(name = "notes", length = 512)
	private String notes;

	@Column(name = "handover_notes", length = 512)
	private String handoverNotes;

	@Column(name = "is_recurring", nullable = false)
	private boolean isRecurring = false;

	public StaffUser getStaffUser() {
		return staffUser;
	}

	public void setStaffUser(StaffUser staffUser) {
		this.staffUser = staffUser;
	}

	public StaffRole getRole() {
		return role;
	}

	public void setRole(StaffRole role) {
		this.role = role;
	}

	public Department getDepartment() {
		return department;
	}

	public void setDepartment(Department department) {
		this.department = department;
	}

	public ShiftType getShiftType() {
		return shiftType;
	}

	public void setShiftType(ShiftType shiftType) {
		this.shiftType = shiftType;
	}

	public ShiftStatus getStatus() {
		return status;
	}

	public void setStatus(ShiftStatus status) {
		this.status = status;
	}

	public OffsetDateTime getStartsAt() {
		return startsAt;
	}

	public void setStartsAt(OffsetDateTime startsAt) {
		if (startsAt != null) {
			this.startsAt = startsAt.withOffsetSameInstant(ZoneId.of("Africa/Nairobi").getRules().getOffset(startsAt.toInstant()));
		} else {
			this.startsAt = null;
		}
	}

	public OffsetDateTime getEndsAt() {
		return endsAt;
	}

	public void setEndsAt(OffsetDateTime endsAt) {
		if (endsAt != null) {
			this.endsAt = endsAt.withOffsetSameInstant(ZoneId.of("Africa/Nairobi").getRules().getOffset(endsAt.toInstant()));
		} else {
			this.endsAt = null;
		}
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	public String getHandoverNotes() {
		return handoverNotes;
	}

	public void setHandoverNotes(String handoverNotes) {
		this.handoverNotes = handoverNotes;
	}

	public boolean isRecurring() {
		return isRecurring;
	}

	public void setRecurring(boolean isRecurring) {
		this.isRecurring = isRecurring;
	}
}
