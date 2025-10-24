package com.afyaquik.hms.snapshot.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.snapshot.domain.DeviceSnapshot;
import com.afyaquik.hms.snapshot.domain.SnapshotType;

@Repository
public interface DeviceSnapshotRepository extends JpaRepository<DeviceSnapshot, Long> {
    
    /**
     * Find the latest snapshot for a device
     */
    DeviceSnapshot findTopByDeviceIdAndTenantIdOrderByVersionDesc(String deviceId, String tenantId);
    
    /**
     * Find all snapshots for a device ordered by version descending
     */
    List<DeviceSnapshot> findByDeviceIdAndTenantIdOrderByVersionDesc(String deviceId, String tenantId);
    
    /**
     * Find snapshots by type for a device
     */
    List<DeviceSnapshot> findByDeviceIdAndTenantIdAndSnapshotTypeOrderByVersionDesc(
            String deviceId, String tenantId, SnapshotType snapshotType);
    
    /**
     * Find snapshots created after a specific timestamp
     */
    List<DeviceSnapshot> findByDeviceIdAndTenantIdAndCreatedAtAfterOrderByVersionDesc(
            String deviceId, String tenantId, LocalDateTime since);
    
    /**
     * Find expired snapshots
     */
    List<DeviceSnapshot> findByExpiresAtBefore(LocalDateTime now);
    
    /**
     * Find snapshots by tenant
     */
    List<DeviceSnapshot> findByTenantIdOrderByCreatedAtDesc(String tenantId);
    
    /**
     * Count snapshots for a device
     */
    long countByDeviceIdAndTenantId(String deviceId, String tenantId);
    
    /**
     * Find snapshots by data size range
     */
    List<DeviceSnapshot> findByDataSizeBetween(Integer minSize, Integer maxSize);
    
    /**
     * Find snapshots by compression status
     */
    List<DeviceSnapshot> findByIsCompressed(Boolean isCompressed);
    
    /**
     * Find snapshots by checksum
     */
    Optional<DeviceSnapshot> findByChecksum(String checksum);
    
    /**
     * Delete snapshots older than specified date
     */
    void deleteByCreatedAtBefore(LocalDateTime cutoffDate);
    
    /**
     * Delete snapshots for a specific device
     */
    void deleteByDeviceIdAndTenantId(String deviceId, String tenantId);
    
    /**
     * Find snapshots with specific version range
     */
    @Query("SELECT s FROM DeviceSnapshot s WHERE s.deviceId = :deviceId AND s.tenantId = :tenantId " +
           "AND s.version BETWEEN :startVersion AND :endVersion ORDER BY s.version DESC")
    List<DeviceSnapshot> findByDeviceIdAndTenantIdAndVersionBetween(
            @Param("deviceId") String deviceId,
            @Param("tenantId") String tenantId,
            @Param("startVersion") Long startVersion,
            @Param("endVersion") Long endVersion);
    
    /**
     * Find the latest full snapshot for a device
     */
    @Query("SELECT s FROM DeviceSnapshot s WHERE s.deviceId = :deviceId AND s.tenantId = :tenantId " +
           "AND s.snapshotType = 'FULL' ORDER BY s.version DESC")
    DeviceSnapshot findLatestFullSnapshot(@Param("deviceId") String deviceId, @Param("tenantId") String tenantId);
    
    /**
     * Find incremental snapshots since a specific version
     */
    @Query("SELECT s FROM DeviceSnapshot s WHERE s.deviceId = :deviceId AND s.tenantId = :tenantId " +
           "AND s.snapshotType = 'INCREMENTAL' AND s.version > :sinceVersion ORDER BY s.version ASC")
    List<DeviceSnapshot> findIncrementalSnapshotsSince(
            @Param("deviceId") String deviceId,
            @Param("tenantId") String tenantId,
            @Param("sinceVersion") Long sinceVersion);
    
    /**
     * Get snapshot statistics for a tenant
     */
    @Query("SELECT COUNT(s), AVG(s.dataSize), MAX(s.dataSize), MIN(s.dataSize) " +
           "FROM DeviceSnapshot s WHERE s.tenantId = :tenantId")
    Object[] getSnapshotStatistics(@Param("tenantId") String tenantId);
    
    /**
     * Find devices with most recent activity
     */
    @Query("SELECT s.deviceId, MAX(s.createdAt) as lastActivity " +
           "FROM DeviceSnapshot s WHERE s.tenantId = :tenantId " +
           "GROUP BY s.deviceId ORDER BY lastActivity DESC")
    List<Object[]> findDevicesByLastActivity(@Param("tenantId") String tenantId);
}

