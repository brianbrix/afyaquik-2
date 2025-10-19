package com.afyaquik.hms.audit.api;

import com.afyaquik.hms.audit.dto.AuditLogDto;
import com.afyaquik.hms.audit.dto.AuditLogFilterRequest;
import com.afyaquik.hms.audit.service.AuditLogService;
import com.afyaquik.hms.common.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * REST Controller for audit log operations.
 */
@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@Slf4j
public class AuditLogController {

    private final AuditLogService auditLogService;

    /**
     * Get audit logs with pagination and filtering.
     */
    @GetMapping
    @PreAuthorize("hasPermission(null,'VIEW_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getAuditLogs(
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
            log.info("Fetching audit logs with filters");

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

            Page<AuditLogDto> auditLogs = auditLogService.getAuditLogs(filter);
            return ResponseEntity.ok(ApiResponse.success(auditLogs, 200,"Audit logs retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching audit logs", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch audit logs: " + e.getMessage()));
        }
    }

    /**
     * Get audit logs by date range.
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasPermission(null,'VIEW_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getAuditLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        try {
            log.info("Fetching audit logs for date range: {} to {}", startDate, endDate);

            AuditLogFilterRequest filter = AuditLogFilterRequest.builder()
                    .startDate(startDate)
                    .endDate(endDate)
                    .page(page)
                    .size(size)
                    .sortBy(sortBy)
                    .sortDirection(sortDirection)
                    .build();

            Page<AuditLogDto> auditLogs = auditLogService.getAuditLogsByDateRange(startDate, endDate, filter);
            return ResponseEntity.ok(ApiResponse.success(auditLogs, 200,"Audit logs retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching audit logs by date range", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch audit logs: " + e.getMessage()));
        }
    }

    /**
     * Get audit logs by user.
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasPermission(null,'VIEW_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getAuditLogsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        try {
            log.info("Fetching audit logs for user: {}", userId);

            AuditLogFilterRequest filter = AuditLogFilterRequest.builder()
                    .page(page)
                    .size(size)
                    .sortBy(sortBy)
                    .sortDirection(sortDirection)
                    .build();

            Page<AuditLogDto> auditLogs = auditLogService.getAuditLogsByUser(userId, filter);
            return ResponseEntity.ok(ApiResponse.success(auditLogs, 200,"Audit logs retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching audit logs for user", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch audit logs: " + e.getMessage()));
        }
    }

    /**
     * Get audit logs by action.
     */
    @GetMapping("/action/{action}")
    @PreAuthorize("hasPermission(null,'VIEW_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getAuditLogsByAction(
            @PathVariable String action,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        try {
            log.info("Fetching audit logs for action: {}", action);

            AuditLogFilterRequest filter = AuditLogFilterRequest.builder()
                    .page(page)
                    .size(size)
                    .sortBy(sortBy)
                    .sortDirection(sortDirection)
                    .build();

            Page<AuditLogDto> auditLogs = auditLogService.getAuditLogsByAction(action, filter);
            return ResponseEntity.ok(ApiResponse.success(auditLogs, 200,"Audit logs retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching audit logs for action", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch audit logs: " + e.getMessage()));
        }
    }

    /**
     * Get audit logs by entity type.
     */
    @GetMapping("/entity-type/{entityType}")
    @PreAuthorize("hasPermission(null,'VIEW_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getAuditLogsByEntityType(
            @PathVariable String entityType,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        try {
            log.info("Fetching audit logs for entity type: {}", entityType);

            AuditLogFilterRequest filter = AuditLogFilterRequest.builder()
                    .page(page)
                    .size(size)
                    .sortBy(sortBy)
                    .sortDirection(sortDirection)
                    .build();

            Page<AuditLogDto> auditLogs = auditLogService.getAuditLogsByEntityType(entityType, filter);
            return ResponseEntity.ok(ApiResponse.success(auditLogs, 200,"Audit logs retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching audit logs for entity type", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch audit logs: " + e.getMessage()));
        }
    }

    /**
     * Get audit logs by status.
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasPermission(null,'VIEW_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> getAuditLogsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        try {
            log.info("Fetching audit logs for status: {}", status);

            AuditLogFilterRequest filter = AuditLogFilterRequest.builder()
                    .page(page)
                    .size(size)
                    .sortBy(sortBy)
                    .sortDirection(sortDirection)
                    .build();

            Page<AuditLogDto> auditLogs = auditLogService.getAuditLogsByStatus(status, filter);
            return ResponseEntity.ok(ApiResponse.success(auditLogs, 200,"Audit logs retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching audit logs for status", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch audit logs: " + e.getMessage()));
        }
    }

    /**
     * Search audit logs by term.
     */
    @GetMapping("/search")
    @PreAuthorize("hasPermission(null,'VIEW_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<Page<AuditLogDto>>> searchAuditLogs(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(defaultValue = "timestamp") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        try {
            log.info("Searching audit logs for term: {}", q);

            AuditLogFilterRequest filter = AuditLogFilterRequest.builder()
                    .searchTerm(q)
                    .page(page)
                    .size(size)
                    .sortBy(sortBy)
                    .sortDirection(sortDirection)
                    .build();

            Page<AuditLogDto> auditLogs = auditLogService.searchAuditLogs(q, filter);
            return ResponseEntity.ok(ApiResponse.success(auditLogs, 200,"Audit logs retrieved successfully"));
        } catch (Exception e) {
            log.error("Error searching audit logs", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to search audit logs: " + e.getMessage()));
        }
    }

    /**
     * Get distinct actions.
     */
    @GetMapping("/distinct/actions")
    @PreAuthorize("hasPermission(null,'VIEW_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctActions() {
        try {
            log.info("Fetching distinct actions");
            List<String> actions = auditLogService.getDistinctActions();
            return ResponseEntity.ok(ApiResponse.success(actions,200, "Distinct actions retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching distinct actions", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch distinct actions: " + e.getMessage()));
        }
    }

    /**
     * Get distinct entity types.
     */
    @GetMapping("/distinct/entity-types")
    @PreAuthorize("hasPermission(null,'VIEW_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctEntityTypes() {
        try {
            log.info("Fetching distinct entity types");
            List<String> entityTypes = auditLogService.getDistinctEntityTypes();
            return ResponseEntity.ok(ApiResponse.success(entityTypes,200, "Distinct entity types retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching distinct entity types", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch distinct entity types: " + e.getMessage()));
        }
    }

    /**
     * Get distinct statuses.
     */
    @GetMapping("/distinct/statuses")
    @PreAuthorize("hasPermission(null,'VIEW_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctStatuses() {
        try {
            log.info("Fetching distinct statuses");
            List<String> statuses = auditLogService.getDistinctStatuses();
            return ResponseEntity.ok(ApiResponse.success(statuses, 200, "Distinct statuses retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching distinct statuses", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch distinct statuses: " + e.getMessage()));
        }
    }

    /**
     * Get distinct HTTP methods.
     */
    @GetMapping("/distinct/http-methods")
    @PreAuthorize("hasPermission(null,'VIEW_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctHttpMethods() {
        try {
            log.info("Fetching distinct HTTP methods");
            List<String> httpMethods = auditLogService.getDistinctHttpMethods();
            return ResponseEntity.ok(ApiResponse.success(httpMethods, 200,"Distinct HTTP methods retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching distinct HTTP methods", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch distinct HTTP methods: " + e.getMessage()));
        }
    }

    /**
     * Get distinct usernames.
     */
    @GetMapping("/distinct/usernames")
    @PreAuthorize("hasPermission(null,'VIEW_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctUsernames() {
        try {
            log.info("Fetching distinct usernames");
            List<String> usernames = auditLogService.getDistinctUsernames();
            return ResponseEntity.ok(ApiResponse.success(usernames, 200, "Distinct usernames retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching distinct usernames", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch distinct usernames: " + e.getMessage()));
        }
    }

    /**
     * Get distinct IP addresses.
     */
    @GetMapping("/distinct/ip-addresses")
    @PreAuthorize("hasPermission(null,'VIEW_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctIpAddresses() {
        try {
            log.info("Fetching distinct IP addresses");
            List<String> ipAddresses = auditLogService.getDistinctIpAddresses();
            return ResponseEntity.ok(ApiResponse.success(ipAddresses, 200, "Distinct IP addresses retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching distinct IP addresses", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch distinct IP addresses: " + e.getMessage()));
        }
    }

    /**
     * Get audit log statistics.
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasPermission(null,'VIEW_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<Object[]>> getAuditLogStatistics() {
        try {
            log.info("Fetching audit log statistics");
            Object[] statistics = auditLogService.getAuditLogStatistics();
            return ResponseEntity.ok(ApiResponse.success(statistics, 200,"Audit log statistics retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching audit log statistics", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch audit log statistics: " + e.getMessage()));
        }
    }

    /**
     * Get audit log statistics for a date range.
     */
    @GetMapping("/statistics/date-range")
    @PreAuthorize("hasPermission(null,'VIEW_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<Object[]>> getAuditLogStatisticsForDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate) {
        try {
            log.info("Fetching audit log statistics for date range: {} to {}", startDate, endDate);
            Object[] statistics = auditLogService.getAuditLogStatisticsForDateRange(startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success(statistics, 200,"Audit log statistics retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching audit log statistics for date range", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch audit log statistics: " + e.getMessage()));
        }
    }

    /**
     * Export audit logs to CSV.
     */
    @GetMapping("/export/csv")
    @PreAuthorize("hasPermission(null,'EXPORT_AUDIT_LOGS')")
    public ResponseEntity<String> exportAuditLogsToCsv(
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
            @RequestParam(required = false) String searchTerm) {
        try {
            log.info("Exporting audit logs to CSV");

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
                    .build();

            String csvContent = auditLogService.exportAuditLogsToCsv(filter);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "audit-logs.csv");
            
            return new ResponseEntity<>(csvContent, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error exporting audit logs to CSV", e);
            return ResponseEntity.internalServerError().body("Failed to export audit logs: " + e.getMessage());
        }
    }

    /**
     * Export audit logs to JSON.
     */
    @GetMapping("/export/json")
    @PreAuthorize("hasPermission(null,'EXPORT_AUDIT_LOGS')")
    public ResponseEntity<List<AuditLogDto>> exportAuditLogsToJson(
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
            @RequestParam(required = false) String searchTerm) {
        try {
            log.info("Exporting audit logs to JSON");

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
                    .build();

            List<AuditLogDto> auditLogs = auditLogService.exportAuditLogsToJson(filter);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setContentDispositionFormData("attachment", "audit-logs.json");
            
            return new ResponseEntity<>(auditLogs, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error exporting audit logs to JSON", e);
            return ResponseEntity.internalServerError().body(null);
        }
    }

    /**
     * Create a new audit log entry.
     */
    @PostMapping
    @PreAuthorize("hasPermission('CREATE_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<AuditLogDto>> createAuditLog(@RequestBody AuditLogDto auditLogDto) {
        try {
            log.info("Creating audit log entry");
            // Implementation would go here
            return ResponseEntity.ok(ApiResponse.success(auditLogDto,200, "Audit log created successfully"));
        } catch (Exception e) {
            log.error("Error creating audit log", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to create audit log: " + e.getMessage()));
        }
    }

    /**
     * Update an audit log entry.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasPermission('UPDATE_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<AuditLogDto>> updateAuditLog(
            @PathVariable Long id,
            @RequestBody AuditLogDto auditLogDto) {
        try {
            log.info("Updating audit log: {}", id);
            AuditLogDto updatedAuditLog = auditLogService.updateAuditLog(id, auditLogDto);
            return ResponseEntity.ok(ApiResponse.success(updatedAuditLog, 200,"Audit log updated successfully"));
        } catch (Exception e) {
            log.error("Error updating audit log", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to update audit log: " + e.getMessage()));
        }
    }

    /**
     * Delete an audit log entry.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission('DELETE_AUDIT_LOGS')")
    public ResponseEntity<ApiResponse<Void>> deleteAuditLog(@PathVariable Long id) {
        try {
            log.info("Deleting audit log: {}", id);
            auditLogService.deleteAuditLog(id);
            return ResponseEntity.ok(ApiResponse.success(null, 200,"Audit log deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting audit log", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to delete audit log: " + e.getMessage()));
        }
    }
}
