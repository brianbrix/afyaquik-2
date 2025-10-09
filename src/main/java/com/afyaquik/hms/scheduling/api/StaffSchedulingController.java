package com.afyaquik.hms.scheduling.api;

import com.afyaquik.hms.common.web.TenantHeaderResolver;
import com.afyaquik.hms.scheduling.domain.ShiftStatus;
import com.afyaquik.hms.scheduling.dto.StaffShiftDto;
import com.afyaquik.hms.scheduling.service.StaffSchedulingService;
import jakarta.validation.Valid;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import com.afyaquik.hms.auth.security.ShiftManageAccess;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/scheduling")
@PreAuthorize("hasAnyRole('ADMIN','RECEPTION','TRIAGE','PROVIDER','PHARMACY','BILLING','NURSE')")
public class StaffSchedulingController {

	private final StaffSchedulingService schedulingService;

	public StaffSchedulingController(StaffSchedulingService schedulingService) {
		this.schedulingService = schedulingService;
	}

	@GetMapping("/shifts")
	public List<StaffShiftResponse> list(
			@RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenant,
			@RequestParam(name = "staffUserId", required = false) Long staffUserId,
			@RequestParam(name = "status", required = false) String status,
			@RequestParam(name = "roleKey", required = false) String roleKey,
			@RequestParam(name = "rangeStart", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime rangeStart,
			@RequestParam(name = "rangeEnd", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime rangeEnd) {
		String tenantId = TenantHeaderResolver.resolveTenantId(tenant);
		Optional<ShiftStatus> statusFilter = parseStatus(status);

		List<StaffShiftDto> results = schedulingService.listShifts(
				tenantId,
				Optional.ofNullable(staffUserId),
				statusFilter,
				Optional.ofNullable(roleKey),
				Optional.ofNullable(rangeStart),
				Optional.ofNullable(rangeEnd));

		return results.stream().map(this::toResponse).toList();
	}

	@GetMapping("/shifts/{shiftId}")
	public StaffShiftResponse get(
			@RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenant,
			@PathVariable Long shiftId) {
		String tenantId = TenantHeaderResolver.resolveTenantId(tenant);
		StaffShiftDto shift = schedulingService.getShift(tenantId, shiftId);
		return toResponse(shift);
	}

	@PostMapping("/shifts")
	@ShiftManageAccess
	public ResponseEntity<StaffShiftResponse> create(
			@RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenant,
			@Valid @RequestBody CreateStaffShiftRequest request) {
		String tenantId = TenantHeaderResolver.resolveTenantId(tenant);
		StaffShiftDto created = schedulingService.createShift(tenantId, request);
		return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(created));
	}

	@PutMapping("/shifts/{shiftId}")
	@ShiftManageAccess
	public StaffShiftResponse update(
			@RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenant,
			@PathVariable Long shiftId,
			@Valid @RequestBody UpdateStaffShiftRequest request) {
		String tenantId = TenantHeaderResolver.resolveTenantId(tenant);
		StaffShiftDto updated = schedulingService.updateShift(tenantId, shiftId, request);
		return toResponse(updated);
	}

	@PostMapping("/shifts/{shiftId}/swap-request")
	public StaffShiftResponse requestSwap(
			@RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenant,
			@PathVariable Long shiftId,
			@Valid @RequestBody ShiftSwapRequest request) {
		String tenantId = TenantHeaderResolver.resolveTenantId(tenant);
		StaffShiftDto updated = schedulingService.requestSwap(tenantId, shiftId, request.note());
		return toResponse(updated);
	}

	@PostMapping("/shifts/{shiftId}/swap-approve")
	@ShiftManageAccess
	public StaffShiftResponse approveSwap(
			@RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenant,
			@PathVariable Long shiftId,
			@Valid @RequestBody ShiftSwapApprovalRequest request) {
		String tenantId = TenantHeaderResolver.resolveTenantId(tenant);
		StaffShiftDto updated = schedulingService.approveSwap(
				tenantId,
				shiftId,
				request.targetStaffUserId(),
				request.note(),
				request.handoverNotes());
		return toResponse(updated);
	}

	private Optional<ShiftStatus> parseStatus(String status) {
		if (status == null || status.isBlank()) {
			return Optional.empty();
		}
		try {
			return Optional.of(ShiftStatus.valueOf(status.trim().toUpperCase(Locale.ROOT)));
		} catch (IllegalArgumentException ex) {
			throw new IllegalStateException("Unsupported status filter: " + status);
		}
	}

	private StaffShiftResponse toResponse(StaffShiftDto dto) {
		return new StaffShiftResponse(
				dto.id(),
				dto.staffUserId(),
				dto.staffDisplayName(),
				dto.roleKey(),
				dto.departmentId(),
				dto.shiftType(),
				dto.status(),
				dto.startsAt(),
				dto.endsAt(),
				dto.notes(),
				dto.handoverNotes());
	}
}
