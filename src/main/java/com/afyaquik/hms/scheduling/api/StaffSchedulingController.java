

package com.afyaquik.hms.scheduling.api;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.scheduling.domain.ShiftStatus;
import com.afyaquik.hms.scheduling.dto.StaffShiftDto;
import com.afyaquik.hms.scheduling.service.StaffSchedulingService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Locale;
import java.util.Optional;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.afyaquik.hms.auth.security.ShiftManageAccess;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.PatchMapping;



// imports cleaned

@RestController
@RequestMapping("/api/v1/scheduling")

public class StaffSchedulingController {

	private final StaffSchedulingService schedulingService;
	// removed unused logger

	public StaffSchedulingController(StaffSchedulingService schedulingService) {
		this.schedulingService = schedulingService;
	}




    @GetMapping("/shifts")
    public Page<StaffShiftDto> list(
		@RequestParam(name = "staffUserId", required = false) Long staffUserId,
		@RequestParam(name = "status", required = false) String status,
		@RequestParam(name = "roleId", required = false) Long roleId,
		@RequestParam(name = "departmentId", required = false) Long departmentId,
		@RequestParam(name = "shiftType", required = false) Long shiftType,
		@RequestParam(name = "rangeStart", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime rangeStart,
            @RequestParam(name = "rangeEnd", required = false) @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime rangeEnd,
            Pageable pageable) {
		String tenantId = TenantHeaderInterceptor.getCurrentTenant();
		Optional<ShiftStatus> statusFilter = parseStatus(status);

        return schedulingService.listShiftsPaged(
			tenantId,
			Optional.ofNullable(staffUserId),
			statusFilter,
			Optional.ofNullable(roleId),
			Optional.ofNullable(departmentId),
			Optional.ofNullable(shiftType),
			Optional.ofNullable(rangeStart),
            Optional.ofNullable(rangeEnd),
            pageable);
	}

	/**
	 * Returns pending check-in and check-out alerts for the logged-in staff user.
	 */
	@GetMapping("/shifts/alerts")
	public List<StaffShiftDto> getShiftAlerts(org.springframework.security.core.Authentication authentication) {
		String tenantId = TenantHeaderInterceptor.getCurrentTenant();
	Long staffUserId = schedulingService.getStaffUserIdFromAuthentication(authentication);
		return schedulingService.findPendingShiftAlerts(tenantId, staffUserId);
	}

	@GetMapping("/shifts/{shiftId}")
		public StaffShiftDto get(
			@PathVariable Long shiftId) {
		String tenantId = TenantHeaderInterceptor.getCurrentTenant();
		return schedulingService.getShift(tenantId, shiftId);
	}

	@PostMapping("/shifts")
	@ShiftManageAccess
		public ResponseEntity<StaffShiftDto> create(
			@Valid @RequestBody CreateStaffShiftRequest request) {
		String tenantId = TenantHeaderInterceptor.getCurrentTenant();
		StaffShiftDto created = schedulingService.createShift(tenantId, request);
		return ResponseEntity.status(HttpStatus.CREATED).body(created);
	}

	@PutMapping("/shifts/{shiftId}")
	@ShiftManageAccess
		public StaffShiftDto update(
			@PathVariable Long shiftId,
			@Valid @RequestBody UpdateStaffShiftRequest request) {
		String tenantId = TenantHeaderInterceptor.getCurrentTenant();
		return schedulingService.updateShift(tenantId, shiftId, request);
	}

	@PostMapping("/shifts/{shiftId}/swap-request")
		public StaffShiftDto requestSwap(
			@PathVariable Long shiftId,
			@Valid @RequestBody ShiftSwapRequest request) {
		String tenantId = TenantHeaderInterceptor.getCurrentTenant();
		return schedulingService.requestSwap(tenantId, shiftId, request.note());
	}

    @PostMapping("/shifts/{shiftId}/swap-approve")
    @ShiftManageAccess
		public StaffShiftDto approveSwap(
	    @PathVariable Long shiftId,
	    @Valid @RequestBody ShiftSwapApprovalRequest request) {
	String tenantId = TenantHeaderInterceptor.getCurrentTenant();
		return schedulingService.approveSwap(
		tenantId,
		shiftId,
		request.targetStaffUserId(),
		request.note(),
		request.handoverNotes());
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

	/**
	 * Allows the shift owner to update their own shift's status and notes only.
	 * No role annotation; ownership is checked in code.
	 */
	@PatchMapping("/shifts/{shiftId}/owner")
	public StaffShiftDto updateOwnShift(
			@PathVariable Long shiftId,
			@Valid @RequestBody UpdateStaffShiftRequest request,
			org.springframework.security.core.Authentication authentication) {
		String tenantId = TenantHeaderInterceptor.getCurrentTenant();
	Long staffUserId = schedulingService.getStaffUserIdFromAuthentication(authentication);
		return schedulingService.updateOwnShift(tenantId, shiftId, staffUserId, request);
	}

}
