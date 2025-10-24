package com.afyaquik.hms.auth.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.auth.domain.Device;

/**
 * Repository for Device entities
 */
@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {
    
    /**
     * Find device by device ID
     */
    Optional<Device> findByDeviceId(String deviceId);
    
    /**
     * Find devices by tenant ID
     */
    List<Device> findByTenantId(String tenantId);
    
    /**
     * Find devices by user ID
     */
    List<Device> findByUserId(Long userId);
    
    /**
     * Find devices by tenant ID and user ID
     */
    List<Device> findByTenantIdAndUserId(String tenantId, Long userId);
    
    /**
     * Find active devices by tenant ID
     */
    List<Device> findByTenantIdAndIsActiveTrue(String tenantId);
    
    /**
     * Find verified devices by tenant ID
     */
    List<Device> findByTenantIdAndIsVerifiedTrue(String tenantId);
    
    /**
     * Find devices by device fingerprint
     */
    Optional<Device> findByDeviceFingerprint(String deviceFingerprint);
    
    /**
     * Find devices with expired tokens
     */
    @Query("SELECT d FROM Device d WHERE d.tokenExpiresAt < :now")
    List<Device> findDevicesWithExpiredTokens(@Param("now") LocalDateTime now);
    
    /**
     * Find devices by tenant ID and device type
     */
    List<Device> findByTenantIdAndDeviceType(String tenantId, String deviceType);
    
    /**
     * Count active devices by tenant ID
     */
    @Query("SELECT COUNT(d) FROM Device d WHERE d.tenantId = :tenantId AND d.isActive = true")
    Long countActiveDevicesByTenant(@Param("tenantId") String tenantId);
    
    /**
     * Find devices by IP address
     */
    List<Device> findByIpAddress(String ipAddress);
    
    /**
     * Find devices by user agent
     */
    List<Device> findByUserAgent(String userAgent);
    
    /**
     * Find devices created after a specific date
     */
    List<Device> findByCreatedAtAfter(LocalDateTime date);
    
    /**
     * Find devices that haven't been seen recently
     */
    @Query("SELECT d FROM Device d WHERE d.lastSeen < :cutoffDate")
    List<Device> findInactiveDevices(@Param("cutoffDate") LocalDateTime cutoffDate);
}
