package com.afyaquik.hms.snapshot.dto;

import java.time.LocalDateTime;

public class DeviceRegistrationResponse {
    
    private String deviceId;
    private String tenantId;
    private Long snapshotId;
    private Long version;
    private Integer dataSize;
    private String createdAt;
    private String message;
    private String deviceToken;
    private Boolean isActive;
    private String registeredAt;
    
    // Constructors
    public DeviceRegistrationResponse() {}
    
    public DeviceRegistrationResponse(String deviceId, String tenantId, Long snapshotId, Long version) {
        this.deviceId = deviceId;
        this.tenantId = tenantId;
        this.snapshotId = snapshotId;
        this.version = version;
    }
    
    // Getters and Setters
    public String getDeviceId() {
        return deviceId;
    }
    
    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }
    
    public String getTenantId() {
        return tenantId;
    }
    
    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }
    
    public Long getSnapshotId() {
        return snapshotId;
    }
    
    public void setSnapshotId(Long snapshotId) {
        this.snapshotId = snapshotId;
    }
    
    public Long getVersion() {
        return version;
    }
    
    public void setVersion(Long version) {
        this.version = version;
    }
    
    public Integer getDataSize() {
        return dataSize;
    }
    
    public void setDataSize(Integer dataSize) {
        this.dataSize = dataSize;
    }
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }

    public String getDeviceToken() {
        return deviceToken;
    }
    
    public void setDeviceToken(String deviceToken) {
        this.deviceToken = deviceToken;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public String getRegisteredAt() {
        return registeredAt;
    }
    
    public void setRegisteredAt(String registeredAt) {
        this.registeredAt = registeredAt;
    }
    
    @Override
    public String toString() {
        return "DeviceRegistrationResponse{" +
                "deviceId='" + deviceId + '\'' +
                ", tenantId='" + tenantId + '\'' +
                ", snapshotId=" + snapshotId +
                ", version=" + version +
                ", dataSize=" + dataSize +
                ", createdAt=" + createdAt +
                ", message='" + message + '\'' +
                ", deviceToken='" + deviceToken + '\'' +
                ", isActive=" + isActive +
                ", registeredAt='" + registeredAt + '\'' +
                '}';
    }
}
