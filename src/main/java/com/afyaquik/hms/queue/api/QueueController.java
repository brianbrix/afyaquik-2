package com.afyaquik.hms.queue.api;

import com.afyaquik.hms.common.web.TenantHeaderResolver;
import com.afyaquik.hms.queue.domain.QueueStatus;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/queue")
@PreAuthorize("hasAnyRole('RECEPTION','TRIAGE','PROVIDER','PHARMACY','BILLING','ADMIN')")
public class QueueController {

    private final QueueService queueService;

    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }

    @PostMapping("/checkin")
    public ResponseEntity<QueueItemResponse> checkIn(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenant,
            @Valid @RequestBody QueueCheckInRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenant);
        QueueItemResponse response = queueService.checkIn(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<QueueSummary> list(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenant,
            @RequestParam(defaultValue = "PENDING_CHECKIN") String status) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenant);
        QueueStatus queueStatus;
        try {
            queueStatus = QueueStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException("Unsupported status filter: " + status);
        }
        return queueService.listByStatus(tenantId, queueStatus);
    }

    @PostMapping("/{queueItemId}/assign")
    public QueueItemResponse assign(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenant,
            @PathVariable Long queueItemId,
            @Valid @RequestBody QueueAssignmentRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenant);
        return queueService.assign(tenantId, queueItemId, request);
    }

    @PostMapping("/{queueItemId}/transition")
    public QueueItemResponse transition(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenant,
            @PathVariable Long queueItemId,
            @Valid @RequestBody QueueTransitionRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenant);
        return queueService.transitionStatus(tenantId, queueItemId, request);
    }

    @GetMapping("/{queueItemId}/timeline")
    public List<QueueTimelineEntryResponse> timeline(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenant,
            @PathVariable Long queueItemId) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenant);
        return queueService.getTimeline(tenantId, queueItemId);
    }
}
