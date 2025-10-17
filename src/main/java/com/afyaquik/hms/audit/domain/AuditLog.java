package com.afyaquik.hms.audit.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

/**
 * Audit log entity for tracking system activities.
 */
@Entity
@Table(name = "audit_logs")
@Getter
@Setter
public class AuditLog extends BaseEntity {

    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @Column(name = "entity_type", nullable = false, length = 100)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "old_values", columnDefinition = "TEXT")
    private String oldValues;

    @Column(name = "new_values", columnDefinition = "TEXT")
    private String newValues;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "username", nullable = false, length = 100)
    private String username;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "request_id", length = 100)
    private String requestId;

    @Column(name = "endpoint", length = 200)
    private String endpoint;

    @Column(name = "http_method", length = 10)
    private String httpMethod;

    @Column(name = "response_status")
    private Integer responseStatus;

    // Constructors
    public AuditLog() {}

    public AuditLog(String action, String entityType, Long entityId, Long userId, String username) {
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.userId = userId;
        this.username = username;
        this.timestamp = LocalDateTime.now();
        this.status = "SUCCESS";
    }

    // Helper methods
    public void markAsError(String errorMessage) {
        this.status = "ERROR";
        this.errorMessage = errorMessage;
    }

    public void setDuration(long durationMs) {
        this.durationMs = durationMs;
    }

    public void setRequestInfo(String requestId, String endpoint, String httpMethod, Integer responseStatus) {
        this.requestId = requestId;
        this.endpoint = endpoint;
        this.httpMethod = httpMethod;
        this.responseStatus = responseStatus;
    }

    public void setClientInfo(String ipAddress, String userAgent, String sessionId) {
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.sessionId = sessionId;
    }
}
