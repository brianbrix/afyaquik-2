package com.afyaquik.hms.snapshot.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "registered_devices")
public class RegisteredDevice extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "device_id", nullable = false, unique = true)
    private String deviceId;
    
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;
    
    @Column(name = "device_name")
    private String deviceName;
    
    @Column(name = "device_type")
    private String deviceType;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "device_token", nullable = false, unique = true)
    private String deviceToken;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;
    
    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;
    
    @Column(name = "deactivated_at")
    private LocalDateTime deactivatedAt;
    
    @Column(name = "max_snapshots")
    private Integer maxSnapshots = 10;
    
    @Column(name = "snapshot_retention_days")
    private Integer snapshotRetentionDays = 30;
    
    @Column(name = "device_info")
    private String deviceInfo; // JSON string with device capabilities
    
    // Constructors
    public RegisteredDevice() {}
    
    public RegisteredDevice(String deviceId, String tenantId, String deviceToken) {
        this.deviceId = deviceId;
        this.tenantId = tenantId;
        this.deviceToken = deviceToken;
        this.registeredAt = LocalDateTime.now();
        this.lastSeenAt = LocalDateTime.now();
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
    
    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }
    
    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }
    
    public LocalDateTime getLastSeenAt() {
        return lastSeenAt;
    }
    
    public void setLastSeenAt(LocalDateTime lastSeenAt) {
        this.lastSeenAt = lastSeenAt;
    }
    
    public LocalDateTime getDeactivatedAt() {
        return deactivatedAt;
    }
    
    public void setDeactivatedAt(LocalDateTime deactivatedAt) {
        this.deactivatedAt = deactivatedAt;
    }
    
    public Integer getMaxSnapshots() {
        return maxSnapshots;
    }
    
    public void setMaxSnapshots(Integer maxSnapshots) {
        this.maxSnapshots = maxSnapshots;
    }
    
    public Integer getSnapshotRetentionDays() {
        return snapshotRetentionDays;
    }
    
    public void setSnapshotRetentionDays(Integer snapshotRetentionDays) {
        this.snapshotRetentionDays = snapshotRetentionDays;
    }
    
    public String getDeviceInfo() {
        return deviceInfo;
    }
    
    public void setDeviceInfo(String deviceInfo) {
        this.deviceInfo = deviceInfo;
    }
    
    // Utility methods
    public boolean isActive() {
        return Boolean.TRUE.equals(isActive);
    }
    
    public boolean isInactive() {
        return !isActive();
    }
    
    public boolean isRecentlySeen(int minutes) {
        return lastSeenAt != null && 
               lastSeenAt.isAfter(LocalDateTime.now().minusMinutes(minutes));
    }
    
    public boolean isStale(int days) {
        return lastSeenAt == null || 
               lastSeenAt.isBefore(LocalDateTime.now().minusDays(days));
    }
    
    @Override
    public String toString() {
        return "RegisteredDevice{" +
                "id=" + id +
                ", deviceId='" + deviceId + '\'' +
                ", tenantId='" + tenantId + '\'' +
                ", deviceName='" + deviceName + '\'' +
                ", deviceType='" + deviceType + '\'' +
                ", isActive=" + isActive +
                ", registeredAt=" + registeredAt +
                ", lastSeenAt=" + lastSeenAt +
                '}';
    }
}

