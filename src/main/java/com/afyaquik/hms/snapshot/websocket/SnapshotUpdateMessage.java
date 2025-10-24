package com.afyaquik.hms.snapshot.websocket;

import java.time.LocalDateTime;

public class SnapshotUpdateMessage {
    private String deviceId;
    private LocalDateTime lastSyncTime;
    private LocalDateTime timestamp;

    public SnapshotUpdateMessage() {}

    public SnapshotUpdateMessage(String deviceId, LocalDateTime lastSyncTime) {
        this.deviceId = deviceId;
        this.lastSyncTime = lastSyncTime;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public LocalDateTime getLastSyncTime() {
        return lastSyncTime;
    }

    public void setLastSyncTime(LocalDateTime lastSyncTime) {
        this.lastSyncTime = lastSyncTime;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}

