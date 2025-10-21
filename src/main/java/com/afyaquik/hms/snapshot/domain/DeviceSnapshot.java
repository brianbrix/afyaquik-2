package com.afyaquik.hms.snapshot.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.Type;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "device_snapshots")
public class DeviceSnapshot extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "device_id", nullable = false)
    private String deviceId;
    
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "snapshot_type", nullable = false)
    private SnapshotType snapshotType;
    
    @Lob
    @Column(name = "snapshot_data", columnDefinition = "TEXT")
    private String snapshotData;
    
    @Column(name = "version", nullable = false)
    private Long version;
    
    @Column(name = "data_size")
    private Integer dataSize;
    
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Column(name = "is_compressed")
    private Boolean isCompressed = false;
    
    @Column(name = "checksum")
    private String checksum;
    
    // Constructors
    public DeviceSnapshot() {}
    
    public DeviceSnapshot(String deviceId, String tenantId, SnapshotType snapshotType) {
        this.deviceId = deviceId;
        this.tenantId = tenantId;
        this.snapshotType = snapshotType;
        this.createdAt = Instant.now();
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
    
    public SnapshotType getSnapshotType() {
        return snapshotType;
    }
    
    public void setSnapshotType(SnapshotType snapshotType) {
        this.snapshotType = snapshotType;
    }
    
    public String getSnapshotData() {
        return snapshotData;
    }
    
    public void setSnapshotData(String snapshotData) {
        this.snapshotData = snapshotData;
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
    
    public Instant getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
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
    
    // Utility methods
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
    
    public boolean isFullSnapshot() {
        return SnapshotType.FULL.equals(snapshotType);
    }
    
    public boolean isIncrementalSnapshot() {
        return SnapshotType.INCREMENTAL.equals(snapshotType);
    }
    
    @Override
    public String toString() {
        return "DeviceSnapshot{" +
                "id=" + id +
                ", deviceId='" + deviceId + '\'' +
                ", tenantId='" + tenantId + '\'' +
                ", snapshotType=" + snapshotType +
                ", version=" + version +
                ", dataSize=" + dataSize +
                ", createdAt=" + createdAt +
                '}';
    }
}
