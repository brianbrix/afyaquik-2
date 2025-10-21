package com.afyaquik.hms.snapshot.dto;

import java.time.LocalDateTime;

public class SnapshotResponse {
    
    private Long id;
    private String deviceId;
    private String tenantId;
    private String snapshotType;
    private Long version;
    private Integer dataSize;
    private String createdAt;
    private String snapshotData;
    private Boolean isCompressed;
    private String checksum;
    
    // Constructors
    public SnapshotResponse() {}
    
    public SnapshotResponse(Long id, String deviceId, String tenantId, String snapshotType, Long version) {
        this.id = id;
        this.deviceId = deviceId;
        this.tenantId = tenantId;
        this.snapshotType = snapshotType;
        this.version = version;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public String getSnapshotType() {
        return snapshotType;
    }
    
    public void setSnapshotType(String snapshotType) {
        this.snapshotType = snapshotType;
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
    
    public String getSnapshotData() {
        return snapshotData;
    }
    
    public void setSnapshotData(String snapshotData) {
        this.snapshotData = snapshotData;
    }
    
    public Boolean getIsCompressed() {
        return isCompressed;
    }
    
    public void setIsCompressed(Boolean isCompressed) {
        this.isCompressed = isCompressed;
    }
    
    public String getChecksum() {
        return checksum;
    }
    
    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }
    
    @Override
    public String toString() {
        return "SnapshotResponse{" +
                "id=" + id +
                ", deviceId='" + deviceId + '\'' +
                ", tenantId='" + tenantId + '\'' +
                ", snapshotType='" + snapshotType + '\'' +
                ", version=" + version +
                ", dataSize=" + dataSize +
                ", createdAt=" + createdAt +
                ", isCompressed=" + isCompressed +
                '}';
    }
}
