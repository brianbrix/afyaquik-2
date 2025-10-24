package com.afyaquik.hms.snapshot.websocket;

import java.time.LocalDateTime;

public class ConflictResolutionMessage {
    private String deviceId;
    private String entityType;
    private String entityId;
    private String resolution;
    private Object resolutionData;
    private LocalDateTime timestamp;

    public ConflictResolutionMessage() {}

    public ConflictResolutionMessage(String deviceId, String entityType, String entityId, String resolution) {
        this.deviceId = deviceId;
        this.entityType = entityType;
        this.entityId = entityId;
        this.resolution = resolution;
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

    public Object getResolutionData() {
        return resolutionData;
    }

    public void setResolutionData(Object resolutionData) {
        this.resolutionData = resolutionData;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}

