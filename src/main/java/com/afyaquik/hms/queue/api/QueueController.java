package com.afyaquik.hms.queue.api;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.queue.domain.QueueStatus;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.queue.dto.QueueSummary;
import com.afyaquik.hms.queue.dto.QueueTimelineEntryResponse;
import com.afyaquik.hms.queue.service.QueueService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/api/v1/queue")
public class QueueController {

    private final QueueService queueService;

    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    @PostMapping("/checkin")
    public ResponseEntity<ApiResponse<QueueItemResponse>> checkIn(@Valid @RequestBody QueueCheckInRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        QueueItemResponse response = queueService.checkIn(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PutMapping("/{queueItemId}")
    public ResponseEntity<ApiResponse<QueueItemResponse>> updateQueueItem(
            @PathVariable Long queueItemId,
            @RequestBody UpdateQueueItemRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        QueueItemResponse response = queueService.updateQueueItem(tenantId, queueItemId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{queueItemId}")
    public ApiResponse<QueueItemResponse> getQueueItem(
            @PathVariable Long queueItemId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(queueService.getQueueItem(tenantId, queueItemId));
    }


    @GetMapping
    public ApiResponse<List<QueueSummary>> list(
            @RequestParam(defaultValue = "PENDING_CHECKIN") String status) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        QueueStatus queueStatus;
        try {
            queueStatus = QueueStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException("Unsupported status filter: " + status);
        }
        // Get current user details
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        boolean isReception = false;
        if (auth != null && auth.getAuthorities() != null) {
            isReception = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_RECEPTION") || a.getAuthority().equals("RECEPTION"));
        }
        if (isReception) {
            return ApiResponse.success(queueService.listByStatus(tenantId, queueStatus));
        } else {
            return ApiResponse.success(queueService.listByStatusAndAssignee(tenantId, queueStatus, username));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<QueueItemResponse>> createQueueItem(@Valid @RequestBody QueueCheckInRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        QueueItemResponse response = queueService.checkIn(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PostMapping("/{queueItemId}/assign")
    public ApiResponse<QueueItemResponse> assign(
            @PathVariable Long queueItemId,
            @Valid @RequestBody QueueAssignmentRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(queueService.assign(tenantId, queueItemId, request));
    }

    @PostMapping("/{queueItemId}/transition")
    public ApiResponse<QueueItemResponse> transition(
            @PathVariable Long queueItemId,
            @Valid @RequestBody QueueTransitionRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(queueService.transitionStatus(tenantId, queueItemId, request));
    }

    @PostMapping("/{queueItemId}/advance-assign")
    public ApiResponse<QueueItemResponse> advanceAssign(
            @PathVariable Long queueItemId,
            @Valid @RequestBody QueueAdvanceAssignRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        QueueAssignmentRequest assign = new QueueAssignmentRequest(
                request.assigneeId(),
                request.assigneeRole(),
                request.assigneeDisplayName(),
                request.departmentId(),
                request.note()
        );
        return ApiResponse.success(queueService.advanceAndAssign(tenantId, queueItemId, request.targetStatus(), assign));
    }

    @GetMapping("/{queueItemId}/timeline")
    public ApiResponse<List<QueueTimelineEntryResponse>> timeline(
            @PathVariable Long queueItemId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(queueService.getTimeline(tenantId, queueItemId));
    }

    // Real-time updates now provided via WebSocket STOMP topics (/topic/queue.{tenantId}).
}
