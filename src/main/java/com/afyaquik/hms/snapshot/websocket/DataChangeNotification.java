package com.afyaquik.hms.snapshot.websocket;

import java.time.LocalDateTime;

public class DataChangeNotification {
    private String type;
    private String sourceDeviceId;
    private LocalDateTime timestamp;
    private String message;

    public DataChangeNotification() {}

    public DataChangeNotification(String type, String sourceDeviceId, String message) {
        this.type = type;
        this.sourceDeviceId = sourceDeviceId;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSourceDeviceId() {
        return sourceDeviceId;
    }

    public void setSourceDeviceId(String sourceDeviceId) {
        this.sourceDeviceId = sourceDeviceId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
