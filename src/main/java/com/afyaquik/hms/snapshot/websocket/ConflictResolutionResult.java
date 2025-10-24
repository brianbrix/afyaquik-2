package com.afyaquik.hms.snapshot.websocket;

import java.time.LocalDateTime;

public class ConflictResolutionResult {
    private String deviceId;
    private String entityType;
    private String entityId;
    private String resolution;
    private String message;
    private LocalDateTime timestamp;

    public ConflictResolutionResult() {}

    public ConflictResolutionResult(String deviceId, String entityType, String entityId, String resolution, String message) {
        this.deviceId = deviceId;
        this.entityType = entityType;
        this.entityId = entityId;
        this.resolution = resolution;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
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

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}

