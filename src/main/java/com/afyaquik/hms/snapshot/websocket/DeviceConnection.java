package com.afyaquik.hms.snapshot.websocket;

import java.time.LocalDateTime;

public class DeviceConnection {
    private String deviceId;
    private String deviceName;
    private LocalDateTime connectedAt;
    private LocalDateTime lastSeen;

    public DeviceConnection() {}

    public DeviceConnection(String deviceId, String deviceName, LocalDateTime connectedAt) {
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.connectedAt = connectedAt;
        this.lastSeen = connectedAt;
    }

    // Getters and Setters
    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public LocalDateTime getConnectedAt() {
        return connectedAt;
    }

    public void setConnectedAt(LocalDateTime connectedAt) {
        this.connectedAt = connectedAt;
    }

    public LocalDateTime getLastSeen() {
        return lastSeen;
    }

    public void setLastSeen(LocalDateTime lastSeen) {
        this.lastSeen = lastSeen;
    }
}
