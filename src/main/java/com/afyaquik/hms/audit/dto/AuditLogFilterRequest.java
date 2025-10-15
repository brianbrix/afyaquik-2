package com.afyaquik.hms.audit.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Request DTO for filtering audit logs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogFilterRequest {
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private List<String> actions;
    private List<String> entityTypes;
    private List<Long> userIds;
    private List<String> usernames;
    private List<String> statuses;
    private String ipAddress;
    private String sessionId;
    private String requestId;
    private String endpoint;
    private String httpMethod;
    private Integer minResponseStatus;
    private Integer maxResponseStatus;
    private Long minDurationMs;
    private Long maxDurationMs;
    private String searchTerm;
    private Integer page;
    private Integer size;
    private String sortBy;
    private String sortDirection;
}
