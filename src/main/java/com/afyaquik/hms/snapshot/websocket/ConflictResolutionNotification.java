package com.afyaquik.hms.snapshot.websocket;

import java.time.LocalDateTime;

public class ConflictResolutionNotification {
    private String type;
    private String resolvedByDeviceId;
    private String entityType;
    private String entityId;
    private LocalDateTime timestamp;

    public ConflictResolutionNotification() {}

    public ConflictResolutionNotification(String type, String resolvedByDeviceId, String entityType, String entityId) {
        this.type = type;
        this.resolvedByDeviceId = resolvedByDeviceId;
        this.entityType = entityType;
        this.entityId = entityId;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getResolvedByDeviceId() {
        return resolvedByDeviceId;
    }

    public void setResolvedByDeviceId(String resolvedByDeviceId) {
        this.resolvedByDeviceId = resolvedByDeviceId;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}

