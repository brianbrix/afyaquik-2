

package com.afyaquik.hms.scheduling.service;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.scheduling.api.CreateStaffShiftRequest;
import com.afyaquik.hms.scheduling.api.UpdateStaffShiftRequest;
import com.afyaquik.hms.scheduling.domain.ShiftStatus;
import com.afyaquik.hms.scheduling.domain.StaffShift;
import com.afyaquik.hms.scheduling.dto.StaffShiftDto;
// Removed StaffShiftResponse import
import com.afyaquik.hms.scheduling.repository.StaffShiftRepository;
import com.afyaquik.hms.scheduling.repository.ShiftTypeRepository;
import com.afyaquik.hms.auth.repository.DepartmentRepository;
import com.afyaquik.hms.auth.repository.StaffRoleRepository;
import jakarta.persistence.EntityNotFoundException;


import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import org.springframework.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.afyaquik.hms.notification.service.NotificationService;

@Service
@Transactional(readOnly = true)
public class StaffSchedulingService {

	private static final Logger log = LoggerFactory.getLogger(StaffSchedulingService.class);

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
	private final ShiftTypeRepository shiftTypeRepository;
	private final DepartmentRepository departmentRepository;
	private final StaffRoleRepository staffRoleRepository;
	private final NotificationService notificationService;

	public StaffSchedulingService(StaffShiftRepository shiftRepository, StaffUserRepository staffUserRepository, ShiftTypeRepository shiftTypeRepository, DepartmentRepository departmentRepository, StaffRoleRepository staffRoleRepository, NotificationService notificationService) {
		this.shiftRepository = shiftRepository;
		this.staffUserRepository = staffUserRepository;
		this.shiftTypeRepository = shiftTypeRepository;
		this.departmentRepository = departmentRepository;
		this.staffRoleRepository = staffRoleRepository;
		this.notificationService = notificationService;
	}



	/**
	 * Utility to get staff user ID from authentication principal (username)
	 */
	public Long getStaffUserIdFromAuthentication(org.springframework.security.core.Authentication authentication) {
		String tenantId = TenantHeaderInterceptor.getCurrentTenant();
		String username = authentication.getName();
		StaffUser user = staffUserRepository.findByTenantIdAndUsername(tenantId, username)
			.orElseThrow(() -> new IllegalStateException("Staff user not found for username: " + username));
		return user.getId();
	}

	public List<StaffShiftDto> listShifts(String tenantId,
										  Optional<Long> staffUserId,
										  Optional<ShiftStatus> status,
										  Optional<Long> roleId,
										  Optional<Long> departmentId,
										  Optional<Long> shiftTypeId,
										  Optional<OffsetDateTime> rangeStart,
										  Optional<OffsetDateTime> rangeEnd) {
		log.debug("Listing shifts tenant={} staffUserId={} status={} roleId={} departmentId={} shiftTypeId={} rangeStart={} rangeEnd={}", tenantId, staffUserId, status, roleId, departmentId, shiftTypeId, rangeStart, rangeEnd);
		com.afyaquik.hms.scheduling.domain.ShiftType shiftTypeEntity = null;
		com.afyaquik.hms.auth.domain.Department departmentEntity = null;
		com.afyaquik.hms.auth.domain.StaffRole roleEntity = null;
		if (shiftTypeId.isPresent()) {
			shiftTypeEntity = shiftTypeRepository.findById(shiftTypeId.get()).orElse(null);
		}
		if (departmentId.isPresent()) {
			departmentEntity = departmentRepository.findById(departmentId.get()).orElse(null);
		}
		if (roleId.isPresent()) {
			roleEntity = staffRoleRepository.findById(roleId.get()).orElse(null);
		}
		var spec = com.afyaquik.hms.scheduling.repository.StaffShiftSpecifications.withFilters(
			tenantId,
			staffUserId.orElse(null),
			status.orElse(null),
			roleEntity,
			departmentEntity,
			shiftTypeEntity,
			rangeStart.orElse(null),
			rangeEnd.orElse(null)
		);
		List<StaffShift> shifts = shiftRepository.findAll(spec);
		List<StaffShiftDto> dtos = shifts.stream().map(this::toDto).toList();
		log.debug("Found {} shifts for tenant={}", dtos.size(), tenantId);
		return dtos;
	}

	/**
	 * Allows the shift owner to update their own shift's status and notes only.
	 * Throws if not owner or invalid transition.
	 */
	@Transactional
	public StaffShiftDto updateOwnShift(String tenantId, Long shiftId, Long staffUserId, UpdateStaffShiftRequest request) {
		StaffShift shift = getShiftForTenant(tenantId, shiftId);
		if (!shift.getStaffUser().getId().equals(staffUserId)) {
			throw new IllegalStateException("Only the shift owner can update their shift");
		}
		// Only allow status transitions that are valid
		ensureTransitionAllowed(shift.getStatus(), request.status());
		shift.setStatus(request.status());
		shift.setNotes(trimToNull(request.notes()));
		// Save and return updated DTO
		shiftRepository.save(shift);
		return toDto(shift);
	}


	/**
	 * Returns shifts for a staff user that require check-in or check-out alerts.
	 */
	public List<StaffShiftDto> findPendingShiftAlerts(String tenantId, Long staffUserId) {
		OffsetDateTime now = OffsetDateTime.now(ZoneId.of("Africa/Nairobi"));

		// Shifts that are scheduled to start now or earlier but not checked in
		log.info("Finding pending check-in for tenantId: {}, staffUserId: {}, status: {}, before: {}", tenantId, staffUserId, ShiftStatus.SCHEDULED, now.plusMinutes(1));

		List<StaffShift> pendingCheckIn = shiftRepository.findPendingCheckIn(
			tenantId, staffUserId, ShiftStatus.SCHEDULED, now.plusMinutes(1));
		// Shifts that are past their end time but not checked out (still checked in or in progress)
		List<StaffShift> pendingCheckOut = shiftRepository.findPendingCheckOut(
			tenantId, staffUserId, List.of(ShiftStatus.CHECKED_IN, ShiftStatus.IN_PROGRESS), now);
		log.info("Found {} pending check-in and {} pending check-out shifts for staffUserId={} tenant={}",
			pendingCheckIn.size(), pendingCheckOut.size(), staffUserId, tenantId);
		return java.util.stream.Stream.concat(pendingCheckIn.stream(), pendingCheckOut.stream())
			.map(this::toDto)
			.toList();
	}

	@Transactional
	public StaffShiftDto createShift(String tenantId, CreateStaffShiftRequest request) {
		log.info("Creating shift tenant={} staffUserId={}", tenantId, request.staffUserId());
		StaffUser staffUser = getStaffUserForTenant(tenantId, request.staffUserId());
		validateTimeRange(request.startsAt(), request.endsAt());
		ensureNoOverlap(tenantId, staffUser.getId(), request.startsAt(), request.endsAt(), null);

		var shiftType = shiftTypeRepository.findById(request.shiftTypeId())
			.orElseThrow(() -> new EntityNotFoundException("Shift type not found"));

		StaffShift shift = new StaffShift();
		shift.setTenantId(tenantId);
		shift.setStaffUser(staffUser);
		var role = staffRoleRepository.findById(request.roleId())
			.orElseThrow(() -> new EntityNotFoundException("Role not found"));
		var department = departmentRepository.findById(request.departmentId())
			.orElseThrow(() -> new EntityNotFoundException("Department not found"));
		shift.setRole(role);
		shift.setDepartment(department);
		shift.setShiftType(shiftType);
		shift.setStatus(ShiftStatus.SCHEDULED);
		shift.setStartsAt(request.startsAt());
		shift.setEndsAt(request.endsAt());
		shift.setNotes(trimToNull(request.notes()));

		StaffShift saved = shiftRepository.save(shift);
		StaffShiftDto dto = toDto(saved);
		log.info("Shift created tenant={} shiftId={}", tenantId, dto.id());
		// Notify staff user of new shift
		notificationService.sendNotification(
			"SHIFT_CREATED",
			Map.of(
				"staffName", staffUser.getDisplayName(),
				"roleName", shift.getRole() != null ? shift.getRole().getDisplayName() : null,
				"departmentName", shift.getDepartment() != null ? shift.getDepartment().getDisplayName() : null,
				"shiftType", shiftType.getName(),
				"startsAt", shift.getStartsAt().toString(),
				"endsAt", shift.getEndsAt().toString()
			),
			staffUser.getId().toString(),
			"IN_APP"
		);
		return dto;
	}

	public StaffShiftDto getShift(String tenantId, Long shiftId) {
		log.debug("Getting shift tenant={} shiftId={}", tenantId, shiftId);
		StaffShift shift = getShiftForTenant(tenantId, shiftId);
	StaffShiftDto dto = toDto(shift);
	log.debug("Got shift tenant={} shiftId={}", tenantId, shiftId);
	return dto;
	}

	@Transactional
	public StaffShiftDto updateShift(String tenantId, Long shiftId, UpdateStaffShiftRequest request) {
		log.info("Updating shift tenant={} shiftId={}", tenantId, shiftId);
		StaffShift shift = getShiftForTenant(tenantId, shiftId);

		Long previousStaffUserId = shift.getStaffUser().getId();
		StaffUser targetStaffUser = shift.getStaffUser();
		if (request.staffUserId() != null && !request.staffUserId().equals(previousStaffUserId)) {
			targetStaffUser = getStaffUserForTenant(tenantId, request.staffUserId());
			shift.setStaffUser(targetStaffUser);
		}

		if (request.roleId() != null) {
			var role = staffRoleRepository.findById(request.roleId())
				.orElseThrow(() -> new EntityNotFoundException("Role not found"));
			shift.setRole(role);
		}
		if (request.departmentId() != null) {
			var department = departmentRepository.findById(request.departmentId())
				.orElseThrow(() -> new EntityNotFoundException("Department not found"));
			shift.setDepartment(department);
		}
		if (request.shiftTypeId() != null) {
			var shiftType = shiftTypeRepository.findById(request.shiftTypeId())
				.orElseThrow(() -> new EntityNotFoundException("Shift type not found"));
			shift.setShiftType(shiftType);
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
		StaffShiftDto dto = toDto(saved);
		log.info("Shift updated tenant={} shiftId={}", tenantId, shiftId);
		return dto;
	}

	@Transactional
	public StaffShiftDto requestSwap(String tenantId, Long shiftId, String note) {
		log.info("Requesting swap tenant={} shiftId={}", tenantId, shiftId);
		StaffShift shift = getShiftForTenant(tenantId, shiftId);
		ensureTransitionAllowed(shift.getStatus(), ShiftStatus.SWAP_REQUESTED);
		if (!StringUtils.hasText(note)) {
			throw new IllegalStateException("Swap request note is required");
		}
		shift.setStatus(ShiftStatus.SWAP_REQUESTED);
		shift.setNotes(trimToNull(note));
		StaffShift saved = shiftRepository.save(shift);
	StaffShiftDto dto = toDto(saved);
	log.info("Swap requested tenant={} shiftId={}", tenantId, shiftId);
	// Notify admins/coordinators of swap request (for demo, notify staff user)
		notificationService.sendNotification(
			"SHIFT_SWAP_REQUESTED",
			Map.of(
				"staffName", shift.getStaffUser().getDisplayName(),
				"shiftId", shift.getId().toString(),
				"startsAt", shift.getStartsAt().toString(),
				"note", note
			),
			shift.getStaffUser().getId().toString(),
			"IN_APP"
		);
	return dto;
	}

	@Transactional
	public StaffShiftDto approveSwap(String tenantId,
									 Long shiftId,
									 Long targetStaffUserId,
									 String note,
									 String handoverNotes) {
		log.info("Approving swap tenant={} shiftId={} targetStaffUserId={}", tenantId, shiftId, targetStaffUserId);
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
	StaffShiftDto dto = toDto(saved);
	log.info("Swap approved tenant={} shiftId={} newStaffUserId={}", tenantId, shiftId, targetStaffUserId);
	// Notify replacement staff user
		notificationService.sendNotification(
			"SHIFT_SWAP_APPROVED",
			Map.of(
				"staffName", replacement.getDisplayName(),
				"shiftId", shift.getId().toString(),
				"startsAt", shift.getStartsAt().toString(),
				"handoverNotes", handoverNotes != null ? handoverNotes : ""
			),
			replacement.getId().toString(),
			"IN_APP"
		);
	return dto;
	}

	// Removed toResponse method

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
				shift.getRole() != null ? shift.getRole().getId() : null,
				shift.getRole() != null ? shift.getRole().getDisplayName() : null,
				shift.getDepartment() != null ? shift.getDepartment().getId() : null,
				shift.getDepartment() != null ? shift.getDepartment().getDisplayName() : null,
				shift.getShiftType() != null ? shift.getShiftType().getId() : null,
				shift.getShiftType() != null ? shift.getShiftType().getName() : null,
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
