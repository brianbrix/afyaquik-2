package com.afyaquik.hms.snapshot.websocket;

import java.time.LocalDateTime;

public class NoChangesMessage {
    private String deviceId;
    private String message;
    private LocalDateTime timestamp;

    public NoChangesMessage() {}

    public NoChangesMessage(String deviceId, String message) {
        this.deviceId = deviceId;
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

