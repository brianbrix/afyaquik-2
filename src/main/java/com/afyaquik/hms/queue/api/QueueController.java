package com.afyaquik.hms.queue.api;

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

import com.afyaquik.hms.audit.annotation.Auditable;
import com.afyaquik.hms.auth.security.CustomPermissionEvaluator;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.queue.domain.QueueStatus;
import com.afyaquik.hms.queue.dto.QueueSummary;
import com.afyaquik.hms.queue.dto.QueueTimelineEntryResponse;
import com.afyaquik.hms.queue.service.QueueReadonlyService;
import com.afyaquik.hms.queue.service.QueueService;

import jakarta.validation.Valid;



@RestController
@Auditable(entityType = "Queue", description = "Queue management operations")
@RequestMapping("/api/v1/queue")
public class QueueController {

    private final QueueService queueService;
    private final QueueReadonlyService queueReadonlyService;
    private final CustomPermissionEvaluator customPermissionEvaluator;

    public QueueController(QueueService queueService, QueueReadonlyService queueReadonlyService, CustomPermissionEvaluator customPermissionEvaluator) {
        this.queueService = queueService;
        this.queueReadonlyService = queueReadonlyService;
        this.customPermissionEvaluator = customPermissionEvaluator;
    }

    @PostMapping("/checkin")
    @Auditable(action = "CHECKIN_PATIENT", entityType = "Queue", description = "Patient check-in to queue")
    public ResponseEntity<ApiResponse<QueueItemResponse>> checkIn(@Valid @RequestBody QueueCheckInRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        QueueItemResponse response = queueService.checkIn(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PutMapping("/{queueItemId}")
    @Auditable(action = "UPDATE_QUEUE_ITEM", entityType = "Queue", entityIdField = "queueItemId", description = "Update queue item")
    public ResponseEntity<ApiResponse<QueueItemResponse>> updateQueueItem(
            @PathVariable Long queueItemId,
            @RequestBody UpdateQueueItemRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        QueueItemResponse response = queueService.updateQueueItem(tenantId, queueItemId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{queueItemId}")
    @Auditable(action = "VIEW_QUEUE_ITEM", entityType = "Queue", entityIdField = "queueItemId", auditGet = true, description = "View queue item details")
    public ApiResponse<QueueItemResponse> getQueueItem(
            @PathVariable Long queueItemId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(queueService.getQueueItem(tenantId, queueItemId));
    }


    @GetMapping
    @Auditable(action = "LIST_QUEUE_ITEMS", entityType = "Queue", auditGet = true, description = "List queue items by status")
    public ApiResponse<List<QueueSummary>> list(
            @RequestParam(defaultValue = "PENDING_CHECKIN") String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
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
        boolean canViewAllClosedQueueItems = false;
        if (auth != null && auth.getAuthorities() != null) {
            isReception = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_RECEPTION") || a.getAuthority().equals("RECEPTION") || a.getAuthority().equals("ROLE_RECEPTIONIST") || a.getAuthority().equals("RECEPTIONIST"));
            canViewAllClosedQueueItems = customPermissionEvaluator.hasPermission(auth, null, "VIEW_ALL_CLOSED_QUEUE_ITEMS");
        }
        
        // Parse dates if provided
        java.time.Instant startInstant = null;
        java.time.Instant endInstant = null;
        
        if (startDate != null && !startDate.trim().isEmpty()) {
            try {
                startInstant = java.time.LocalDate.parse(startDate).atStartOfDay().toInstant(java.time.ZoneOffset.UTC);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid start date format. Use YYYY-MM-DD");
            }
        }
        
        if (endDate != null && !endDate.trim().isEmpty()) {
            try {
                endInstant = java.time.LocalDate.parse(endDate).atTime(23, 59, 59).toInstant(java.time.ZoneOffset.UTC);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid end date format. Use YYYY-MM-DD");
            }
        }
        
        // Use date filtering if dates are provided
        if (startInstant != null && endInstant != null) {
            if (canViewAllClosedQueueItems && queueStatus == QueueStatus.CLOSED) {
                return ApiResponse.success(queueService.listByStatusAndDate(tenantId, QueueStatus.CLOSED, startInstant, endInstant));
            } else {
            if (isReception) {
                return ApiResponse.success(queueService.listByStatusAndDate(tenantId, queueStatus, startInstant, endInstant));
            } else {
                return ApiResponse.success(queueService.listByStatusAndAssigneeAndDate(tenantId, queueStatus, username, startInstant, endInstant));
            }
        }
        } else {
            // Use original methods without date filtering
            if (canViewAllClosedQueueItems && queueStatus == QueueStatus.CLOSED) {
                return ApiResponse.success(queueService.listByStatus(tenantId, QueueStatus.CLOSED));
            } else {
            if (isReception) {
                return ApiResponse.success(queueService.listByStatus(tenantId, queueStatus));
            } else {
                return ApiResponse.success(queueService.listByStatusAndAssignee(tenantId, queueStatus, username));
            }
            }
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

    @GetMapping("/{queueItemId}/readonly")
    public ApiResponse<Boolean> isReadonly(@PathVariable Long queueItemId) {
        boolean isReadonly = queueReadonlyService.isQueueItemReadonly(queueItemId);
        return ApiResponse.success(isReadonly);
    }

    // Real-time updates now provided via WebSocket STOMP topics (/topic/queue.{tenantId}).
}
