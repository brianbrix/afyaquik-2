package com.afyaquik.hms.scheduling.domain;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

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

	@Column(name = "role_key", nullable = false, length = 64)
	private String roleKey;

	@Column(name = "department_id", nullable = false, length = 64)
	private String departmentId;

	@Enumerated(EnumType.STRING)
	@Column(name = "shift_type", nullable = false, length = 32)
	private ShiftType shiftType;

	@Enumerated(EnumType.STRING)
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

	public StaffUser getStaffUser() {
		return staffUser;
	}

	public void setStaffUser(StaffUser staffUser) {
		this.staffUser = staffUser;
	}

	public String getRoleKey() {
		return roleKey;
	}

	public void setRoleKey(String roleKey) {
		this.roleKey = roleKey;
	}

	public String getDepartmentId() {
		return departmentId;
	}

	public void setDepartmentId(String departmentId) {
		this.departmentId = departmentId;
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
		this.startsAt = startsAt;
	}

	public OffsetDateTime getEndsAt() {
		return endsAt;
	}

	public void setEndsAt(OffsetDateTime endsAt) {
		this.endsAt = endsAt;
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
}
