package com.afyaquik.hms.snapshot.websocket;

import java.time.LocalDateTime;

public class ConnectionAcknowledgment {
    private String deviceId;
    private String status;
    private LocalDateTime timestamp;
    private String message;

    public ConnectionAcknowledgment() {}

    public ConnectionAcknowledgment(String deviceId, String status, String message) {
        this.deviceId = deviceId;
        this.status = status;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

