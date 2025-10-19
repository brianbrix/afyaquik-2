package com.afyaquik.hms.superadmin.api;

import com.afyaquik.hms.audit.dto.AuditLogDto;
import com.afyaquik.hms.audit.dto.AuditLogFilterRequest;
import com.afyaquik.hms.audit.service.AuditLogService;
import com.afyaquik.hms.common.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * REST Controller for super admin audit log operations.
 * Only accessible by SUPER_ADMIN users.
 */
@RestController
@RequestMapping("/api/v1/super-admin/audit-logs")
@RequiredArgsConstructor
@Slf4j
public class SuperAdminAuditLogController {

    private final AuditLogService auditLogService;

    /**
     * Get all audit logs across all tenants (super admin only).
     */
    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getAllAuditLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
            @RequestParam(required = false) List<String> actions,
            @RequestParam(required = false) List<String> entityTypes,
            @RequestParam(required = false) List<Long> userIds,
            @RequestParam(required = false) List<String> usernames,
            @RequestParam(required = false) List<String> statuses,
            @RequestParam(required = false) String ipAddress,
            @RequestParam(required = false) String sessionId,
            @RequestParam(required = false) String requestId,
            @RequestParam(required = false) String endpoint,
            @RequestParam(required = false) String httpMethod,
            @RequestParam(required = false) Integer minResponseStatus,
            @RequestParam(required = false) Integer maxResponseStatus,
            @RequestParam(required = false) Long minDurationMs,
            @RequestParam(required = false) Long maxDurationMs,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        try {
            log.info("Super admin fetching all audit logs with filters");

            // Handle 'undefined' string values from frontend
            OffsetDateTime validStartDate = startDate;
            OffsetDateTime validEndDate = endDate;

            AuditLogFilterRequest filter = AuditLogFilterRequest.builder()
                    .startDate(validStartDate)
                    .endDate(validEndDate)
                    .actions(actions)
                    .entityTypes(entityTypes)
                    .userIds(userIds)
                    .usernames(usernames)
                    .statuses(statuses)
                    .ipAddress(ipAddress)
                    .sessionId(sessionId)
                    .requestId(requestId)
                    .endpoint(endpoint)
                    .httpMethod(httpMethod)
                    .minResponseStatus(minResponseStatus)
                    .maxResponseStatus(maxResponseStatus)
                    .minDurationMs(minDurationMs)
                    .maxDurationMs(maxDurationMs)
                    .searchTerm(searchTerm)
                    .page(page)
                    .size(size)
                    .sortBy(sortBy)
                    .sortDirection(sortDirection)
                    .build();

            Page<AuditLogDto> auditLogs = auditLogService.getAuditLogsForSuperAdmin(filter);
            return ResponseEntity.ok(ApiResponse.success(auditLogs, 200, "All audit logs retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching all audit logs for super admin", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch audit logs: " + e.getMessage()));
        }
    }

    /**
     * Get audit logs for a specific tenant (super admin only).
     */
    @GetMapping("/tenant/{tenantId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getAuditLogsByTenant(
            @PathVariable String tenantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
            @RequestParam(required = false) List<String> actions,
            @RequestParam(required = false) List<String> entityTypes,
            @RequestParam(required = false) List<Long> userIds,
            @RequestParam(required = false) List<String> usernames,
            @RequestParam(required = false) List<String> statuses,
            @RequestParam(required = false) String ipAddress,
            @RequestParam(required = false) String sessionId,
            @RequestParam(required = false) String requestId,
            @RequestParam(required = false) String endpoint,
            @RequestParam(required = false) String httpMethod,
            @RequestParam(required = false) Integer minResponseStatus,
            @RequestParam(required = false) Integer maxResponseStatus,
            @RequestParam(required = false) Long minDurationMs,
            @RequestParam(required = false) Long maxDurationMs,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        try {
            log.info("Super admin fetching audit logs for tenant: {}", tenantId);

            AuditLogFilterRequest filter = AuditLogFilterRequest.builder()
                    .startDate(startDate)
                    .endDate(endDate)
                    .actions(actions)
                    .entityTypes(entityTypes)
                    .userIds(userIds)
                    .usernames(usernames)
                    .statuses(statuses)
                    .ipAddress(ipAddress)
                    .sessionId(sessionId)
                    .requestId(requestId)
                    .endpoint(endpoint)
                    .httpMethod(httpMethod)
                    .minResponseStatus(minResponseStatus)
                    .maxResponseStatus(maxResponseStatus)
                    .minDurationMs(minDurationMs)
                    .maxDurationMs(maxDurationMs)
                    .searchTerm(searchTerm)
                    .page(page)
                    .size(size)
                    .sortBy(sortBy)
                    .sortDirection(sortDirection)
                    .build();

            Page<AuditLogDto> auditLogs = auditLogService.getAuditLogsForSuperAdminByTenant(tenantId, filter);
            return ResponseEntity.ok(ApiResponse.success(auditLogs, 200, "Audit logs for tenant retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching audit logs for tenant: {}", tenantId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch audit logs for tenant: " + e.getMessage()));
        }
    }

    /**
     * Get distinct tenants from audit logs.
     */
    @GetMapping("/tenants")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctTenants() {
        try {
            log.info("Super admin fetching distinct tenants from audit logs");
            List<String> tenants = auditLogService.getDistinctTenants();
            return ResponseEntity.ok(ApiResponse.success(tenants, 200, "Distinct tenants retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching distinct tenants", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch distinct tenants: " + e.getMessage()));
        }
    }

    /**
     * Get distinct actions for super admin.
     */
    @GetMapping("/distinct/actions")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctActions() {
        try {
            log.info("Fetching distinct actions for super admin");
            List<String> actions = auditLogService.getDistinctActionsForSuperAdmin();
            return ResponseEntity.ok(ApiResponse.success(actions, 200, "Distinct actions retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching distinct actions for super admin", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch distinct actions: " + e.getMessage()));
        }
    }

    /**
     * Get distinct entity types for super admin.
     */
    @GetMapping("/distinct/entity-types")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctEntityTypes() {
        try {
            log.info("Fetching distinct entity types for super admin");
            List<String> entityTypes = auditLogService.getDistinctEntityTypesForSuperAdmin();
            return ResponseEntity.ok(ApiResponse.success(entityTypes, 200, "Distinct entity types retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching distinct entity types for super admin", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch distinct entity types: " + e.getMessage()));
        }
    }

    /**
     * Get distinct statuses for super admin.
     */
    @GetMapping("/distinct/statuses")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctStatuses() {
        try {
            log.info("Fetching distinct statuses for super admin");
            List<String> statuses = auditLogService.getDistinctStatusesForSuperAdmin();
            return ResponseEntity.ok(ApiResponse.success(statuses, 200, "Distinct statuses retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching distinct statuses for super admin", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch distinct statuses: " + e.getMessage()));
        }
    }

    /**
     * Get distinct HTTP methods for super admin.
     */
    @GetMapping("/distinct/http-methods")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctHttpMethods() {
        try {
            log.info("Fetching distinct HTTP methods for super admin");
            List<String> httpMethods = auditLogService.getDistinctHttpMethodsForSuperAdmin();
            return ResponseEntity.ok(ApiResponse.success(httpMethods, 200, "Distinct HTTP methods retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching distinct HTTP methods for super admin", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch distinct HTTP methods: " + e.getMessage()));
        }
    }

    /**
     * Get distinct usernames for super admin.
     */
    @GetMapping("/distinct/usernames")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctUsernames() {
        try {
            log.info("Fetching distinct usernames for super admin");
            List<String> usernames = auditLogService.getDistinctUsernamesForSuperAdmin();
            return ResponseEntity.ok(ApiResponse.success(usernames, 200, "Distinct usernames retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching distinct usernames for super admin", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch distinct usernames: " + e.getMessage()));
        }
    }

    /**
     * Get distinct IP addresses for super admin.
     */
    @GetMapping("/distinct/ip-addresses")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctIpAddresses() {
        try {
            log.info("Fetching distinct IP addresses for super admin");
            List<String> ipAddresses = auditLogService.getDistinctIpAddressesForSuperAdmin();
            return ResponseEntity.ok(ApiResponse.success(ipAddresses, 200, "Distinct IP addresses retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching distinct IP addresses for super admin", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch distinct IP addresses: " + e.getMessage()));
        }
    }
}
