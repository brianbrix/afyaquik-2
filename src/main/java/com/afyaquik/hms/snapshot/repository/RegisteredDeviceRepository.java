package com.afyaquik.hms.snapshot.repository;

import com.afyaquik.hms.snapshot.domain.RegisteredDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegisteredDeviceRepository extends JpaRepository<RegisteredDevice, Long> {
    
    /**
     * Find device by device ID and tenant ID
     */
    Optional<RegisteredDevice> findByDeviceIdAndTenantId(String deviceId, String tenantId);
    
    /**
     * Find device by device token
     */
    Optional<RegisteredDevice> findByDeviceToken(String deviceToken);
    
    /**
     * Find all devices for a tenant ordered by registration date
     */
    List<RegisteredDevice> findByTenantIdOrderByRegisteredAtDesc(String tenantId);
    
    /**
     * Find active devices for a tenant
     */
    List<RegisteredDevice> findByTenantIdAndIsActiveTrueOrderByLastSeenAtDesc(String tenantId);
    
    /**
     * Find inactive devices for a tenant
     */
    List<RegisteredDevice> findByTenantIdAndIsActiveFalseOrderByDeactivatedAtDesc(String tenantId);
    
    /**
     * Find devices by device type
     */
    List<RegisteredDevice> findByTenantIdAndDeviceTypeOrderByRegisteredAtDesc(String tenantId, String deviceType);
    
    /**
     * Find devices that haven't been seen for a specific period
     */
    List<RegisteredDevice> findByLastSeenAtBeforeAndIsActiveTrue(LocalDateTime cutoffDate);
    
    /**
     * Find devices by device name (case insensitive)
     */
    List<RegisteredDevice> findByTenantIdAndDeviceNameContainingIgnoreCaseOrderByRegisteredAtDesc(
            String tenantId, String deviceName);
    
    /**
     * Count active devices for a tenant
     */
    long countByTenantIdAndIsActiveTrue(String tenantId);
    
    /**
     * Count devices by type for a tenant
     */
    long countByTenantIdAndDeviceTypeAndIsActiveTrue(String tenantId, String deviceType);
    
    /**
     * Find devices registered after a specific date
     */
    List<RegisteredDevice> findByTenantIdAndRegisteredAtAfterOrderByRegisteredAtDesc(
            String tenantId, LocalDateTime since);
    
    /**
     * Find devices by device ID pattern
     */
    List<RegisteredDevice> findByTenantIdAndDeviceIdContainingIgnoreCaseOrderByRegisteredAtDesc(
            String tenantId, String deviceIdPattern);
    
    /**
     * Find devices with specific snapshot limits
     */
    List<RegisteredDevice> findByTenantIdAndMaxSnapshotsGreaterThanOrderByRegisteredAtDesc(
            String tenantId, Integer maxSnapshots);
    
    /**
     * Find devices with specific retention days
     */
    List<RegisteredDevice> findByTenantIdAndSnapshotRetentionDaysOrderByRegisteredAtDesc(
            String tenantId, Integer retentionDays);
    
    /**
     * Find devices that need cleanup (based on retention days)
     */
    @Query("SELECT d FROM RegisteredDevice d WHERE d.tenantId = :tenantId " +
           "AND d.lastSeenAt < :cutoffDate AND d.isActive = true")
    List<RegisteredDevice> findDevicesNeedingCleanup(@Param("tenantId") String tenantId, 
                                                     @Param("cutoffDate") LocalDateTime cutoffDate);
    
    /**
     * Get device statistics for a tenant
     */
    @Query("SELECT d.deviceType, COUNT(d) FROM RegisteredDevice d WHERE d.tenantId = :tenantId " +
           "GROUP BY d.deviceType")
    List<Object[]> getDeviceStatisticsByType(@Param("tenantId") String tenantId);
    
    /**
     * Find devices with most recent activity
     */
    @Query("SELECT d FROM RegisteredDevice d WHERE d.tenantId = :tenantId " +
           "ORDER BY d.lastSeenAt DESC NULLS LAST")
    List<RegisteredDevice> findDevicesByLastActivity(@Param("tenantId") String tenantId);
    
    /**
     * Find devices by registration date range
     */
    @Query("SELECT d FROM RegisteredDevice d WHERE d.tenantId = :tenantId " +
           "AND d.registeredAt BETWEEN :startDate AND :endDate " +
           "ORDER BY d.registeredAt DESC")
    List<RegisteredDevice> findDevicesByRegistrationDateRange(
            @Param("tenantId") String tenantId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find devices with specific device info
     */
    @Query("SELECT d FROM RegisteredDevice d WHERE d.tenantId = :tenantId " +
           "AND d.deviceInfo LIKE %:info% ORDER BY d.registeredAt DESC")
    List<RegisteredDevice> findDevicesByDeviceInfo(@Param("tenantId") String tenantId, 
                                                   @Param("info") String deviceInfo);
}

