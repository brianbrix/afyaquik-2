package com.afyaquik.hms.audit.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.Instant;
import java.time.OffsetDateTime;

/**
 * DTO for audit log data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private Long id;
    private String action;
    private String entityType;
    private Long entityId;
    private String oldValues;
    private String newValues;
    private Long userId;
    private String username;
    private String ipAddress;
    private String userAgent;
    private String sessionId;
    private Instant timestamp;
    private String status;
    private String errorMessage;
    private Long durationMs;
    private String requestId;
    private String endpoint;
    private String httpMethod;
    private Integer responseStatus;
    private String tenantId;
    private Instant createdAt;
    private Instant updatedAt;
}
