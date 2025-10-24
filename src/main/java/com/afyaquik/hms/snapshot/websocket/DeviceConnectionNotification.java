package com.afyaquik.hms.snapshot.websocket;

import java.time.LocalDateTime;

public class DeviceConnectionNotification {
    private String type;
    private String deviceId;
    private String deviceName;
    private LocalDateTime timestamp;

    public DeviceConnectionNotification() {}

    public DeviceConnectionNotification(String type, String deviceId, String deviceName) {
        this.type = type;
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

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

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}

