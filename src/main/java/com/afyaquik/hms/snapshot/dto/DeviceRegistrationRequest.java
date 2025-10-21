package com.afyaquik.hms.snapshot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DeviceRegistrationRequest {
    
    @NotBlank(message = "Device ID is required")
    @Size(max = 100, message = "Device ID must not exceed 100 characters")
    private String deviceId;
    
    @Size(max = 50, message = "Device name must not exceed 50 characters")
    private String deviceName;
    
    @Size(max = 100, message = "Device type must not exceed 100 characters")
    private String deviceType;
    
    @Size(max = 200, message = "Device description must not exceed 200 characters")
    private String description;
    
    // Constructors
    public DeviceRegistrationRequest() {}
    
    public DeviceRegistrationRequest(String deviceId, String deviceName, String deviceType) {
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.deviceType = deviceType;
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
    
    public String getDeviceType() {
        return deviceType;
    }
    
    public void setDeviceType(String deviceType) {
        this.deviceType = deviceType;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    @Override
    public String toString() {
        return "DeviceRegistrationRequest{" +
                "deviceId='" + deviceId + '\'' +
                ", deviceName='" + deviceName + '\'' +
                ", deviceType='" + deviceType + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
