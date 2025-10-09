package com.afyaquik.hms.scheduling.service;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.scheduling.api.CreateStaffShiftRequest;
import com.afyaquik.hms.scheduling.api.UpdateStaffShiftRequest;
import com.afyaquik.hms.scheduling.domain.ShiftStatus;
import com.afyaquik.hms.scheduling.domain.StaffShift;
import com.afyaquik.hms.scheduling.dto.StaffShiftDto;
import com.afyaquik.hms.scheduling.repository.StaffShiftRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional(readOnly = true)
public class StaffSchedulingService {

	private static final Map<ShiftStatus, Set<ShiftStatus>> ALLOWED_STATUS_TRANSITIONS = Map.of(
			ShiftStatus.SCHEDULED, Set.of(ShiftStatus.CHECKED_IN, ShiftStatus.CANCELLED, ShiftStatus.SWAP_REQUESTED),
			ShiftStatus.CHECKED_IN, Set.of(ShiftStatus.IN_PROGRESS, ShiftStatus.CANCELLED, ShiftStatus.SWAP_REQUESTED),
			ShiftStatus.IN_PROGRESS, Set.of(ShiftStatus.COMPLETED, ShiftStatus.CANCELLED, ShiftStatus.SWAP_REQUESTED),
			ShiftStatus.COMPLETED, Set.of(),
			ShiftStatus.CANCELLED, Set.of(),
			ShiftStatus.SWAP_REQUESTED, Set.of(ShiftStatus.SWAPPED, ShiftStatus.CANCELLED),
			ShiftStatus.SWAPPED, Set.of(ShiftStatus.CHECKED_IN));

	private final StaffShiftRepository shiftRepository;
	private final StaffUserRepository staffUserRepository;

	public StaffSchedulingService(StaffShiftRepository shiftRepository, StaffUserRepository staffUserRepository) {
		this.shiftRepository = shiftRepository;
		this.staffUserRepository = staffUserRepository;
	}

	public List<StaffShiftDto> listShifts(String tenantId,
										  Optional<Long> staffUserId,
										  Optional<ShiftStatus> status,
										  Optional<String> roleKey,
										  Optional<OffsetDateTime> rangeStart,
										  Optional<OffsetDateTime> rangeEnd) {
		List<StaffShift> shifts;
		if (staffUserId.isPresent() && rangeStart.isPresent() && rangeEnd.isPresent()) {
			shifts = shiftRepository.findByTenantIdAndStaffUser_IdAndStartsAtBetweenOrderByStartsAtAsc(
					tenantId,
					staffUserId.get(),
					rangeStart.get(),
					rangeEnd.get());
		} else if (staffUserId.isPresent()) {
			shifts = shiftRepository.findByTenantIdAndStaffUser_IdOrderByStartsAtAsc(tenantId, staffUserId.get());
		} else if (status.isPresent()) {
			shifts = shiftRepository.findByTenantIdAndStatusOrderByStartsAtAsc(tenantId, status.get());
		} else if (rangeStart.isPresent() && rangeEnd.isPresent()) {
			shifts = shiftRepository.findByTenantIdAndStartsAtBetweenOrderByStartsAtAsc(
					tenantId,
					rangeStart.get(),
					rangeEnd.get());
		}
		else if (roleKey.isPresent()) {
		shifts = shiftRepository.findByRoleKey(roleKey.get());
	} else {
			shifts = shiftRepository.findByTenantIdOrderByStartsAtAsc(tenantId);
		}
		return shifts.stream().map(this::toDto).toList();
	}

	@Transactional
	public StaffShiftDto createShift(String tenantId, CreateStaffShiftRequest request) {
		StaffUser staffUser = getStaffUserForTenant(tenantId, request.staffUserId());
		validateTimeRange(request.startsAt(), request.endsAt());
		ensureNoOverlap(tenantId, staffUser.getId(), request.startsAt(), request.endsAt(), null);

		StaffShift shift = new StaffShift();
		shift.setTenantId(tenantId);
		shift.setStaffUser(staffUser);
		shift.setRoleKey(request.roleKey().trim());
		shift.setDepartmentId(request.departmentId().trim());
		shift.setShiftType(request.shiftType());
		shift.setStatus(ShiftStatus.SCHEDULED);
		shift.setStartsAt(request.startsAt());
		shift.setEndsAt(request.endsAt());
		shift.setNotes(trimToNull(request.notes()));

		StaffShift saved = shiftRepository.save(shift);
		return toDto(saved);
	}

	public StaffShiftDto getShift(String tenantId, Long shiftId) {
		StaffShift shift = getShiftForTenant(tenantId, shiftId);
		return toDto(shift);
	}

	@Transactional
	public StaffShiftDto updateShift(String tenantId, Long shiftId, UpdateStaffShiftRequest request) {
		StaffShift shift = getShiftForTenant(tenantId, shiftId);

		Long previousStaffUserId = shift.getStaffUser().getId();
		StaffUser targetStaffUser = shift.getStaffUser();
		if (request.staffUserId() != null && !request.staffUserId().equals(previousStaffUserId)) {
			targetStaffUser = getStaffUserForTenant(tenantId, request.staffUserId());
			shift.setStaffUser(targetStaffUser);
		}

		if (request.roleKey() != null) {
			shift.setRoleKey(request.roleKey().trim());
		}
		if (request.departmentId() != null) {
			shift.setDepartmentId(request.departmentId().trim());
		}
		if (request.shiftType() != null) {
			shift.setShiftType(request.shiftType());
		}

		OffsetDateTime startsAt = Optional.ofNullable(request.startsAt()).orElse(shift.getStartsAt());
		OffsetDateTime endsAt = Optional.ofNullable(request.endsAt()).orElse(shift.getEndsAt());
		validateTimeRange(startsAt, endsAt);
		ensureNoOverlap(tenantId, targetStaffUser.getId(), startsAt, endsAt, shift.getId());
		shift.setStartsAt(startsAt);
		shift.setEndsAt(endsAt);

		if (request.status() != null && request.status() != shift.getStatus()) {
	    if (request.status() == ShiftStatus.SWAPPED
		    && (request.staffUserId() == null || request.staffUserId().equals(previousStaffUserId))) {
				throw new IllegalStateException("Swapped shifts must identify the replacing staff member");
			}
			if (request.status() == ShiftStatus.SWAP_REQUESTED && !StringUtils.hasText(request.notes())) {
				throw new IllegalStateException("Swap requests must include a note for coordinators");
			}
			ensureTransitionAllowed(shift.getStatus(), request.status());
			shift.setStatus(request.status());
		}

		if (request.notes() != null) {
			shift.setNotes(trimToNull(request.notes()));
		}
		if (request.handoverNotes() != null) {
			shift.setHandoverNotes(trimToNull(request.handoverNotes()));
		}

		StaffShift saved = shiftRepository.save(shift);
		return toDto(saved);
	}

	@Transactional
	public StaffShiftDto requestSwap(String tenantId, Long shiftId, String note) {
		StaffShift shift = getShiftForTenant(tenantId, shiftId);
		ensureTransitionAllowed(shift.getStatus(), ShiftStatus.SWAP_REQUESTED);
		if (!StringUtils.hasText(note)) {
			throw new IllegalStateException("Swap request note is required");
		}
		shift.setStatus(ShiftStatus.SWAP_REQUESTED);
		shift.setNotes(trimToNull(note));
		StaffShift saved = shiftRepository.save(shift);
		return toDto(saved);
	}

	@Transactional
	public StaffShiftDto approveSwap(String tenantId,
									 Long shiftId,
									 Long targetStaffUserId,
									 String note,
									 String handoverNotes) {
		StaffShift shift = getShiftForTenant(tenantId, shiftId);
		ensureTransitionAllowed(shift.getStatus(), ShiftStatus.SWAPPED);

		StaffUser replacement = getStaffUserForTenant(tenantId, targetStaffUserId);
		ensureNoOverlap(tenantId, replacement.getId(), shift.getStartsAt(), shift.getEndsAt(), shift.getId());
		Long previousStaffUserId = shift.getStaffUser().getId();
		if (replacement.getId().equals(previousStaffUserId)) {
			throw new IllegalStateException("Replacement staff must differ from the originally assigned staff");
		}

		shift.setStaffUser(replacement);
		shift.setStatus(ShiftStatus.SWAPPED);
		if (StringUtils.hasText(note)) {
			shift.setNotes(note.trim());
		}
		if (handoverNotes != null) {
			shift.setHandoverNotes(trimToNull(handoverNotes));
		}

		StaffShift saved = shiftRepository.save(shift);
		return toDto(saved);
	}

	private StaffUser getStaffUserForTenant(String tenantId, Long staffUserId) {
		StaffUser user = staffUserRepository.findById(staffUserId)
				.orElseThrow(() -> new EntityNotFoundException("Staff user not found"));
		if (!tenantId.equals(user.getTenantId())) {
			throw new EntityNotFoundException("Staff user not found for tenant");
		}
		return user;
	}

	private StaffShift getShiftForTenant(String tenantId, Long shiftId) {
		StaffShift shift = shiftRepository.findById(shiftId)
				.orElseThrow(() -> new EntityNotFoundException("Staff shift not found"));
		if (!tenantId.equals(shift.getTenantId())) {
			throw new EntityNotFoundException("Staff shift not found");
		}
		return shift;
	}

	private void ensureNoOverlap(String tenantId,
								 Long staffUserId,
								 OffsetDateTime startsAt,
								 OffsetDateTime endsAt,
								 Long excludeShiftId) {
		boolean overlaps = shiftRepository.existsOverlappingShift(tenantId, staffUserId, startsAt, endsAt, excludeShiftId);
		if (overlaps) {
			throw new IllegalStateException("Shift overlaps with an existing assignment for the staff user");
		}
	}

	private void ensureTransitionAllowed(ShiftStatus current, ShiftStatus target) {
		Set<ShiftStatus> allowedTargets = ALLOWED_STATUS_TRANSITIONS.getOrDefault(current, Set.of());
		if (!allowedTargets.contains(target)) {
			throw new IllegalStateException("Transition from " + current + " to " + target + " is not permitted");
		}
	}

	private void validateTimeRange(OffsetDateTime startsAt, OffsetDateTime endsAt) {
		if (startsAt == null || endsAt == null) {
			throw new IllegalStateException("Shift start and end times are required");
		}
		if (!startsAt.isBefore(endsAt)) {
			throw new IllegalStateException("Shift start time must be before end time");
		}
	}

	private StaffShiftDto toDto(StaffShift shift) {
		return new StaffShiftDto(
				shift.getId(),
				shift.getStaffUser().getId(),
				shift.getStaffUser().getDisplayName(),
				shift.getRoleKey(),
				shift.getDepartmentId(),
				shift.getShiftType(),
				shift.getStatus(),
				shift.getStartsAt(),
				shift.getEndsAt(),
				shift.getNotes(),
				shift.getHandoverNotes());
	}

	private String trimToNull(String value) {
		if (!StringUtils.hasText(value)) {
			return null;
		}
		return value.trim();
	}
}
