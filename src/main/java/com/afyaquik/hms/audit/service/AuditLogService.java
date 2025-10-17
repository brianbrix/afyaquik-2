package com.afyaquik.hms.audit.service;

import com.afyaquik.hms.audit.domain.AuditLog;
import com.afyaquik.hms.audit.dto.AuditLogDto;
import com.afyaquik.hms.audit.dto.AuditLogFilterRequest;
import com.afyaquik.hms.audit.repository.AuditLogRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for audit log operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Get audit logs with pagination.
     */
    public Page<AuditLogDto> getAuditLogs(AuditLogFilterRequest filter) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching audit logs for tenant: {} with filter: {}", tenantId, filter);

        Pageable pageable = createPageable(filter);
        Page<AuditLog> auditLogs = auditLogRepository.findByTenantIdOrderByTimestampDesc(tenantId, pageable);

        return auditLogs.map(this::convertToDto);
    }

    /**
     * Get audit logs by date range.
     */
    public Page<AuditLogDto> getAuditLogsByDateRange(OffsetDateTime startDate, OffsetDateTime endDate, AuditLogFilterRequest filter) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching audit logs for tenant: {} from {} to {}", tenantId, startDate, endDate);

        Pageable pageable = createPageable(filter);
        Page<AuditLog> auditLogs = auditLogRepository.findByTenantIdAndTimestampBetween(tenantId, startDate, endDate, pageable);

        return auditLogs.map(this::convertToDto);
    }

    /**
     * Get audit logs by user.
     */
    public Page<AuditLogDto> getAuditLogsByUser(Long userId, AuditLogFilterRequest filter) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching audit logs for user: {} in tenant: {}", userId, tenantId);

        Pageable pageable = createPageable(filter);
        Page<AuditLog> auditLogs = auditLogRepository.findByTenantIdAndUserIdOrderByTimestampDesc(tenantId, userId, pageable);

        return auditLogs.map(this::convertToDto);
    }

    /**
     * Get audit logs by action.
     */
    public Page<AuditLogDto> getAuditLogsByAction(String action, AuditLogFilterRequest filter) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching audit logs for action: {} in tenant: {}", action, tenantId);

        Pageable pageable = createPageable(filter);
        Page<AuditLog> auditLogs = auditLogRepository.findByTenantIdAndActionOrderByTimestampDesc(tenantId, action, pageable);

        return auditLogs.map(this::convertToDto);
    }

    /**
     * Get audit logs by entity type.
     */
    public Page<AuditLogDto> getAuditLogsByEntityType(String entityType, AuditLogFilterRequest filter) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching audit logs for entity type: {} in tenant: {}", entityType, tenantId);

        Pageable pageable = createPageable(filter);
        Page<AuditLog> auditLogs = auditLogRepository.findByTenantIdAndEntityTypeOrderByTimestampDesc(tenantId, entityType, pageable);

        return auditLogs.map(this::convertToDto);
    }

    /**
     * Get audit logs by status.
     */
    public Page<AuditLogDto> getAuditLogsByStatus(String status, AuditLogFilterRequest filter) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching audit logs for status: {} in tenant: {}", status, tenantId);

        Pageable pageable = createPageable(filter);
        Page<AuditLog> auditLogs = auditLogRepository.findByTenantIdAndStatusOrderByTimestampDesc(tenantId, status, pageable);

        return auditLogs.map(this::convertToDto);
    }

    /**
     * Get audit logs by IP address.
     */
    public Page<AuditLogDto> getAuditLogsByIpAddress(String ipAddress, AuditLogFilterRequest filter) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching audit logs for IP: {} in tenant: {}", ipAddress, tenantId);

        Pageable pageable = createPageable(filter);
        Page<AuditLog> auditLogs = auditLogRepository.findByTenantIdAndIpAddressOrderByTimestampDesc(tenantId, ipAddress, pageable);

        return auditLogs.map(this::convertToDto);
    }

    /**
     * Get audit logs by session ID.
     */
    public Page<AuditLogDto> getAuditLogsBySessionId(String sessionId, AuditLogFilterRequest filter) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching audit logs for session: {} in tenant: {}", sessionId, tenantId);

        Pageable pageable = createPageable(filter);
        Page<AuditLog> auditLogs = auditLogRepository.findByTenantIdAndSessionIdOrderByTimestampDesc(tenantId, sessionId, pageable);

        return auditLogs.map(this::convertToDto);
    }

    /**
     * Get audit logs by request ID.
     */
    public Page<AuditLogDto> getAuditLogsByRequestId(String requestId, AuditLogFilterRequest filter) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching audit logs for request: {} in tenant: {}", requestId, tenantId);

        Pageable pageable = createPageable(filter);
        Page<AuditLog> auditLogs = auditLogRepository.findByTenantIdAndRequestIdOrderByTimestampDesc(tenantId, requestId, pageable);

        return auditLogs.map(this::convertToDto);
    }

    /**
     * Get audit logs by endpoint.
     */
    public Page<AuditLogDto> getAuditLogsByEndpoint(String endpoint, AuditLogFilterRequest filter) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching audit logs for endpoint: {} in tenant: {}", endpoint, tenantId);

        Pageable pageable = createPageable(filter);
        Page<AuditLog> auditLogs = auditLogRepository.findByTenantIdAndEndpointContainingOrderByTimestampDesc(tenantId, endpoint, pageable);

        return auditLogs.map(this::convertToDto);
    }

    /**
     * Get audit logs by HTTP method.
     */
    public Page<AuditLogDto> getAuditLogsByHttpMethod(String httpMethod, AuditLogFilterRequest filter) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching audit logs for HTTP method: {} in tenant: {}", httpMethod, tenantId);

        Pageable pageable = createPageable(filter);
        Page<AuditLog> auditLogs = auditLogRepository.findByTenantIdAndHttpMethodOrderByTimestampDesc(tenantId, httpMethod, pageable);

        return auditLogs.map(this::convertToDto);
    }

    /**
     * Get audit logs by response status range.
     */
    public Page<AuditLogDto> getAuditLogsByResponseStatusRange(Integer minStatus, Integer maxStatus, AuditLogFilterRequest filter) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching audit logs for response status range: {} to {} in tenant: {}", minStatus, maxStatus, tenantId);

        Pageable pageable = createPageable(filter);
        Page<AuditLog> auditLogs = auditLogRepository.findByTenantIdAndResponseStatusBetweenOrderByTimestampDesc(tenantId, minStatus, maxStatus, pageable);

        return auditLogs.map(this::convertToDto);
    }

    /**
     * Get audit logs by duration range.
     */
    public Page<AuditLogDto> getAuditLogsByDurationRange(Long minDuration, Long maxDuration, AuditLogFilterRequest filter) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching audit logs for duration range: {} to {} ms in tenant: {}", minDuration, maxDuration, tenantId);

        Pageable pageable = createPageable(filter);
        Page<AuditLog> auditLogs = auditLogRepository.findByTenantIdAndDurationMsBetweenOrderByTimestampDesc(tenantId, minDuration, maxDuration, pageable);

        return auditLogs.map(this::convertToDto);
    }

    /**
     * Search audit logs by term.
     */
    public Page<AuditLogDto> searchAuditLogs(String searchTerm, AuditLogFilterRequest filter) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Searching audit logs for term: {} in tenant: {}", searchTerm, tenantId);

        Pageable pageable = createPageable(filter);
        Page<AuditLog> auditLogs = auditLogRepository.findByTenantIdAndSearchTermOrderByTimestampDesc(tenantId, searchTerm, pageable);

        return auditLogs.map(this::convertToDto);
    }

    /**
     * Get distinct actions for the current tenant.
     */
    public List<String> getDistinctActions() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return auditLogRepository.findDistinctActionsByTenantId(tenantId);
    }

    /**
     * Get distinct entity types for the current tenant.
     */
    public List<String> getDistinctEntityTypes() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return auditLogRepository.findDistinctEntityTypesByTenantId(tenantId);
    }

    /**
     * Get distinct statuses for the current tenant.
     */
    public List<String> getDistinctStatuses() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return auditLogRepository.findDistinctStatusesByTenantId(tenantId);
    }

    /**
     * Get distinct HTTP methods for the current tenant.
     */
    public List<String> getDistinctHttpMethods() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return auditLogRepository.findDistinctHttpMethodsByTenantId(tenantId);
    }

    /**
     * Get audit log statistics for the current tenant.
     */
    public Object[] getAuditLogStatistics() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return auditLogRepository.getAuditLogStatistics(tenantId);
    }

    /**
     * Get audit log statistics for a date range.
     */
    public Object[] getAuditLogStatisticsForDateRange(OffsetDateTime startDate, OffsetDateTime endDate) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return auditLogRepository.getAuditLogStatisticsForDateRange(tenantId, startDate, endDate);
    }

    /**
     * Export audit logs to CSV format.
     */
    public String exportAuditLogsToCsv(AuditLogFilterRequest filter) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Exporting audit logs to CSV for tenant: {}", tenantId);

        // Get all audit logs matching the filter (without pagination)
        Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<AuditLog> auditLogs = auditLogRepository.findByTenantIdOrderByTimestampDesc(tenantId, pageable);

        StringBuilder csv = new StringBuilder();
        csv.append("ID,Action,Entity Type,Entity ID,User ID,Username,IP Address,Session ID,Request ID,Endpoint,HTTP Method,Response Status,Duration (ms),Status,Error Message,Timestamp\n");

        for (AuditLog log : auditLogs.getContent()) {
            csv.append(String.format("%d,%s,%s,%s,%d,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    log.getId(),
                    escapeCsv(log.getAction()),
                    escapeCsv(log.getEntityType()),
                    log.getEntityId() != null ? log.getEntityId().toString() : "",
                    log.getUserId(),
                    escapeCsv(log.getUsername()),
                    escapeCsv(log.getIpAddress()),
                    escapeCsv(log.getSessionId()),
                    escapeCsv(log.getRequestId()),
                    escapeCsv(log.getEndpoint()),
                    escapeCsv(log.getHttpMethod()),
                    log.getResponseStatus() != null ? log.getResponseStatus().toString() : "",
                    log.getDurationMs() != null ? log.getDurationMs().toString() : "",
                    escapeCsv(log.getStatus()),
                    escapeCsv(log.getErrorMessage()),
                    log.getTimestamp().toString()
            ));
        }

        return csv.toString();
    }

    /**
     * Export audit logs to JSON format.
     */
    public List<AuditLogDto> exportAuditLogsToJson(AuditLogFilterRequest filter) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Exporting audit logs to JSON for tenant: {}", tenantId);

        // Get all audit logs matching the filter (without pagination)
        Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<AuditLog> auditLogs = auditLogRepository.findByTenantIdOrderByTimestampDesc(tenantId, pageable);

        return auditLogs.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Create an audit log entry.
     */
    @Transactional
    public AuditLog createAuditLog(String action, String entityType, Long entityId, Long userId, String username) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.debug("Creating audit log for tenant: {}, action: {}, entity: {}", tenantId, action, entityType);

        AuditLog auditLog = new AuditLog(action, entityType, entityId, userId, username);
        auditLog.setTenantId(tenantId);
        
        return auditLogRepository.save(auditLog);
    }

    /**
     * Update an audit log entry.
     */
    @Transactional
    public AuditLogDto updateAuditLog(Long id, AuditLogDto auditLogDto) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.debug("Updating audit log: {} for tenant: {}", id, tenantId);

        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Audit log not found"));

        if (!auditLog.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied");
        }

        // Update fields
        auditLog.setAction(auditLogDto.getAction());
        auditLog.setEntityType(auditLogDto.getEntityType());
        auditLog.setEntityId(auditLogDto.getEntityId());
        auditLog.setOldValues(auditLogDto.getOldValues());
        auditLog.setNewValues(auditLogDto.getNewValues());
        auditLog.setUserId(auditLogDto.getUserId());
        auditLog.setUsername(auditLogDto.getUsername());
        auditLog.setIpAddress(auditLogDto.getIpAddress());
        auditLog.setUserAgent(auditLogDto.getUserAgent());
        auditLog.setSessionId(auditLogDto.getSessionId());
        auditLog.setTimestamp(auditLogDto.getTimestamp().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        auditLog.setStatus(auditLogDto.getStatus());
        auditLog.setErrorMessage(auditLogDto.getErrorMessage());
        auditLog.setDurationMs(auditLogDto.getDurationMs());
        auditLog.setRequestId(auditLogDto.getRequestId());
        auditLog.setEndpoint(auditLogDto.getEndpoint());
        auditLog.setHttpMethod(auditLogDto.getHttpMethod());
        auditLog.setResponseStatus(auditLogDto.getResponseStatus());

        return convertToDto(auditLogRepository.save(auditLog));
    }

    /**
     * Delete an audit log entry.
     */
    @Transactional
    public void deleteAuditLog(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.debug("Deleting audit log: {} for tenant: {}", id, tenantId);

        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Audit log not found"));

        if (!auditLog.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied");
        }

        auditLogRepository.delete(auditLog);
    }

    // Helper methods
    private Pageable createPageable(AuditLogFilterRequest filter) {
        int page = filter.getPage() != null ? filter.getPage() : 0;
        int size = filter.getSize() != null ? filter.getSize() : 20;
        String sortBy = filter.getSortBy() != null ? filter.getSortBy() : "timestamp";
        String sortDirection = filter.getSortDirection() != null ? filter.getSortDirection() : "desc";

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        return PageRequest.of(page, size, sort);
    }

    private AuditLogDto convertToDto(AuditLog auditLog) {
        return AuditLogDto.builder()
                .id(auditLog.getId())
                .action(auditLog.getAction())
                .entityType(auditLog.getEntityType())
                .entityId(auditLog.getEntityId())
                .oldValues(auditLog.getOldValues())
                .newValues(auditLog.getNewValues())
                .userId(auditLog.getUserId())
                .username(auditLog.getUsername())
                .ipAddress(auditLog.getIpAddress())
                .userAgent(auditLog.getUserAgent())
                .sessionId(auditLog.getSessionId())
                .timestamp(auditLog.getTimestamp().atZone(java.time.ZoneId.systemDefault()).toInstant())
                .status(auditLog.getStatus())
                .errorMessage(auditLog.getErrorMessage())
                .durationMs(auditLog.getDurationMs())
                .requestId(auditLog.getRequestId())
                .endpoint(auditLog.getEndpoint())
                .httpMethod(auditLog.getHttpMethod())
                .responseStatus(auditLog.getResponseStatus())
                .tenantId(auditLog.getTenantId())
                .createdAt(auditLog.getCreatedAt())
                .updatedAt(auditLog.getUpdatedAt())
                .build();
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
