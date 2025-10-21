package com.afyaquik.hms.snapshot.service;

import com.afyaquik.hms.snapshot.domain.RegisteredDevice;
import com.afyaquik.hms.snapshot.repository.RegisteredDeviceRepository;
import com.afyaquik.hms.snapshot.dto.DeviceRegistrationRequest;
import com.afyaquik.hms.snapshot.dto.DeviceRegistrationResponse;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class DeviceRegistrationService {
    
    private static final Logger log = LoggerFactory.getLogger(DeviceRegistrationService.class);
    
    @Autowired
    private RegisteredDeviceRepository registeredDeviceRepository;
    
    /**
     * Register a new device
     */
    public DeviceRegistrationResponse registerDevice(DeviceRegistrationRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Registering device: {} for tenant: {}", request.getDeviceId(), tenantId);
        
        // Check if device is already registered
        Optional<RegisteredDevice> existingDevice = registeredDeviceRepository
                .findByDeviceIdAndTenantId(request.getDeviceId(), tenantId);
        
        if (existingDevice.isPresent()) {
            RegisteredDevice device = existingDevice.get();
            
            if (device.getIsActive()) {
                log.warn("Device {} is already registered and active for tenant {}", request.getDeviceId(), tenantId);
                
                // Update last seen time and return existing device info
                device.setLastSeenAt(LocalDateTime.now());
                registeredDeviceRepository.save(device);
                
                // Create response with existing device info
                DeviceRegistrationResponse response = new DeviceRegistrationResponse();
                response.setDeviceId(device.getDeviceId());
                response.setTenantId(device.getTenantId());
                response.setMessage("Device already registered - updated last seen");
                response.setDeviceToken(device.getDeviceToken());
                response.setIsActive(device.getIsActive());
                response.setRegisteredAt(device.getRegisteredAt().toInstant(ZoneOffset.UTC).toString());
                
                return response;
            } else {
                // Reactivate existing device
                log.info("Reactivating existing device: {} for tenant: {}", request.getDeviceId(), tenantId);
                device.setIsActive(true);
                device.setLastSeenAt(LocalDateTime.now());
                device.setDeactivatedAt(null);
                device.setDeviceName(request.getDeviceName()); // Update name if changed
                device.setDeviceType(request.getDeviceType()); // Update type if changed
                device.setDescription(request.getDescription()); // Update description if changed
                
                RegisteredDevice savedDevice = registeredDeviceRepository.save(device);
                
                DeviceRegistrationResponse response = new DeviceRegistrationResponse();
                response.setDeviceId(savedDevice.getDeviceId());
                response.setTenantId(savedDevice.getTenantId());
                response.setMessage("Device reactivated successfully");
                response.setDeviceToken(savedDevice.getDeviceToken());
                response.setIsActive(savedDevice.getIsActive());
                response.setRegisteredAt(savedDevice.getRegisteredAt().toString());
                
                return response;
            }
        }
        
        // Check for duplicate device names within the same tenant (optional validation)
        List<RegisteredDevice> devicesWithSameName = registeredDeviceRepository
                .findByTenantIdAndDeviceNameContainingIgnoreCaseOrderByRegisteredAtDesc(tenantId, request.getDeviceName());
        
        if (!devicesWithSameName.isEmpty()) {
            log.info("Device with similar name already exists for tenant: {} - {} ({} similar devices)", 
                    tenantId, request.getDeviceName(), devicesWithSameName.size());
            // Allow registration but log the similarity for monitoring
        }
        
        // Create new device registration
        RegisteredDevice device = new RegisteredDevice();
        device.setDeviceId(request.getDeviceId());
        device.setTenantId(tenantId);
        device.setDeviceName(request.getDeviceName());
        device.setDeviceType(request.getDeviceType());
        device.setDescription(request.getDescription());
        device.setDeviceToken(generateDeviceToken());
        device.setIsActive(true);
        device.setRegisteredAt(LocalDateTime.now());
        device.setLastSeenAt(LocalDateTime.now());
        device.setMaxSnapshots(10); // Default limit
        device.setSnapshotRetentionDays(30); // Default retention
        
        RegisteredDevice savedDevice = registeredDeviceRepository.save(device);
        
        log.info("Device registered successfully: {} with token: {}", 
                request.getDeviceId(), device.getDeviceToken());
        
        // Create response
        DeviceRegistrationResponse response = new DeviceRegistrationResponse();
        response.setDeviceId(savedDevice.getDeviceId());
        response.setTenantId(savedDevice.getTenantId());
        response.setMessage("Device registered successfully");
        
        return response;
    }
    
    /**
     * Authenticate a device using device token
     */
    public boolean authenticateDevice(String deviceId, String deviceToken) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.debug("Authenticating device: {} for tenant: {}", deviceId, tenantId);
        
        Optional<RegisteredDevice> device = registeredDeviceRepository
                .findByDeviceIdAndTenantId(deviceId, tenantId);
        
        if (device.isEmpty()) {
            log.warn("Device not found: {} for tenant: {}", deviceId, tenantId);
            return false;
        }
        
        RegisteredDevice registeredDevice = device.get();
        
        // Check if device is active
        if (!registeredDevice.getIsActive()) {
            log.warn("Device is inactive: {} for tenant: {}", deviceId, tenantId);
            return false;
        }
        
        // Check if device token matches
        if (!deviceToken.equals(registeredDevice.getDeviceToken())) {
            log.warn("Invalid device token for device: {} for tenant: {}", deviceId, tenantId);
            return false;
        }
        
        // Update last seen timestamp
        registeredDevice.setLastSeenAt(LocalDateTime.now());
        registeredDeviceRepository.save(registeredDevice);
        
        log.debug("Device authenticated successfully: {} for tenant: {}", deviceId, tenantId);
        return true;
    }
    
    /**
     * Get device information
     */
    public Optional<RegisteredDevice> getDevice(String deviceId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return registeredDeviceRepository.findByDeviceIdAndTenantId(deviceId, tenantId);
    }
    
    /**
     * Get all devices for a tenant
     */
    public List<RegisteredDevice> getTenantDevices(String tenantId) {
        return registeredDeviceRepository.findByTenantIdOrderByRegisteredAtDesc(tenantId);
    }
    
    /**
     * Update device information
     */
    public RegisteredDevice updateDevice(String deviceId, DeviceRegistrationRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Updating device: {} for tenant: {}", deviceId, tenantId);
        
        Optional<RegisteredDevice> deviceOpt = registeredDeviceRepository
                .findByDeviceIdAndTenantId(deviceId, tenantId);
        
        if (deviceOpt.isEmpty()) {
            throw new IllegalArgumentException("Device not found");
        }
        
        RegisteredDevice device = deviceOpt.get();
        device.setDeviceName(request.getDeviceName());
        device.setDeviceType(request.getDeviceType());
        device.setDescription(request.getDescription());
        // UpdatedAt is handled by BaseEntity
        
        return registeredDeviceRepository.save(device);
    }
    
    /**
     * Deactivate a device
     */
    public void deactivateDevice(String deviceId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Deactivating device: {} for tenant: {}", deviceId, tenantId);
        
        Optional<RegisteredDevice> deviceOpt = registeredDeviceRepository
                .findByDeviceIdAndTenantId(deviceId, tenantId);
        
        if (deviceOpt.isEmpty()) {
            throw new IllegalArgumentException("Device not found");
        }
        
        RegisteredDevice device = deviceOpt.get();
        device.setIsActive(false);
        device.setDeactivatedAt(LocalDateTime.now());
        // UpdatedAt is handled by BaseEntity
        
        registeredDeviceRepository.save(device);
        log.info("Device deactivated: {} for tenant: {}", deviceId, tenantId);
    }
    
    /**
     * Reactivate a device
     */
    public void reactivateDevice(String deviceId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Reactivating device: {} for tenant: {}", deviceId, tenantId);
        
        Optional<RegisteredDevice> deviceOpt = registeredDeviceRepository
                .findByDeviceIdAndTenantId(deviceId, tenantId);
        
        if (deviceOpt.isEmpty()) {
            throw new IllegalArgumentException("Device not found");
        }
        
        RegisteredDevice device = deviceOpt.get();
        device.setIsActive(true);
        device.setDeactivatedAt(null);
        device.setLastSeenAt(LocalDateTime.now());
        // UpdatedAt is handled by BaseEntity
        
        registeredDeviceRepository.save(device);
        log.info("Device reactivated: {} for tenant: {}", deviceId, tenantId);
    }
    
    /**
     * Generate a new device token
     */
    public String regenerateDeviceToken(String deviceId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Regenerating device token for device: {} for tenant: {}", deviceId, tenantId);
        
        Optional<RegisteredDevice> deviceOpt = registeredDeviceRepository
                .findByDeviceIdAndTenantId(deviceId, tenantId);
        
        if (deviceOpt.isEmpty()) {
            throw new IllegalArgumentException("Device not found");
        }
        
        RegisteredDevice device = deviceOpt.get();
        String newToken = generateDeviceToken();
        device.setDeviceToken(newToken);
        // UpdatedAt is handled by BaseEntity
        
        registeredDeviceRepository.save(device);
        log.info("Device token regenerated for device: {} for tenant: {}", deviceId, tenantId);
        
        return newToken;
    }
    
    /**
     * Clean up inactive devices
     */
    public void cleanupInactiveDevices(int daysInactive) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysInactive);
        List<RegisteredDevice> inactiveDevices = registeredDeviceRepository
                .findByLastSeenAtBeforeAndIsActiveTrue(cutoffDate);
        
        for (RegisteredDevice device : inactiveDevices) {
            device.setIsActive(false);
            device.setDeactivatedAt(LocalDateTime.now());
            // UpdatedAt is handled by BaseEntity
        }
        
        if (!inactiveDevices.isEmpty()) {
            registeredDeviceRepository.saveAll(inactiveDevices);
            log.info("Deactivated {} inactive devices", inactiveDevices.size());
        }
    }
    
    /**
     * Check if a device ID is unique within a tenant
     */
    public boolean isDeviceIdUnique(String deviceId, String tenantId) {
        return !registeredDeviceRepository.findByDeviceIdAndTenantId(deviceId, tenantId).isPresent();
    }
    
    /**
     * Check if a device name is unique within a tenant
     */
    public boolean isDeviceNameUnique(String deviceName, String tenantId) {
        List<RegisteredDevice> devices = registeredDeviceRepository
                .findByTenantIdAndDeviceNameContainingIgnoreCaseOrderByRegisteredAtDesc(tenantId, deviceName);
        return devices.isEmpty();
    }
    
    /**
     * Get suggested device name if the requested name is not unique
     */
    public String getSuggestedDeviceName(String requestedName, String tenantId) {
        List<RegisteredDevice> devices = registeredDeviceRepository
                .findByTenantIdAndDeviceNameContainingIgnoreCaseOrderByRegisteredAtDesc(tenantId, requestedName);
        
        if (devices.isEmpty()) {
            return requestedName;
        }
        
        // Find the next available number
        int counter = 1;
        String suggestedName;
        do {
            suggestedName = requestedName + " (" + counter + ")";
            List<RegisteredDevice> existing = registeredDeviceRepository
                    .findByTenantIdAndDeviceNameContainingIgnoreCaseOrderByRegisteredAtDesc(tenantId, suggestedName);
            if (existing.isEmpty()) {
                break;
            }
            counter++;
        } while (counter < 100); // Prevent infinite loop
        
        return suggestedName;
    }
    
    /**
     * Generate a unique device token
     */
    private String generateDeviceToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }
    
    /**
     * Get device statistics for a tenant
     */
    public Map<String, Object> getDeviceStatistics(String tenantId) {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            List<RegisteredDevice> allDevices = registeredDeviceRepository.findByTenantIdOrderByRegisteredAtDesc(tenantId);
            List<RegisteredDevice> activeDevices = registeredDeviceRepository.findByTenantIdAndIsActiveTrueOrderByLastSeenAtDesc(tenantId);
            
            long totalDevices = allDevices.size();
            long activeDevicesCount = activeDevices.size();
            long inactiveDevicesCount = totalDevices - activeDevicesCount;
            
            // Count by device type
            Map<String, Long> deviceTypes = allDevices.stream()
                    .collect(Collectors.groupingBy(
                            device -> device.getDeviceType() != null ? device.getDeviceType() : "unknown",
                            Collectors.counting()));
            
            // Recent activity (last 24 hours)
            LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
            long recentActivity = allDevices.stream()
                    .filter(device -> device.getLastSeenAt() != null && device.getLastSeenAt().isAfter(yesterday))
                    .count();
            
            stats.put("totalDevices", totalDevices);
            stats.put("activeDevices", activeDevicesCount);
            stats.put("inactiveDevices", inactiveDevicesCount);
            stats.put("deviceTypes", deviceTypes);
            stats.put("recentActivity", recentActivity);
            stats.put("lastUpdated", LocalDateTime.now().toEpochSecond(ZoneOffset.UTC));
            
            log.debug("Generated device statistics for tenant: {} - Total: {}, Active: {}, Inactive: {}", 
                    tenantId, totalDevices, activeDevicesCount, inactiveDevicesCount);
            
        } catch (Exception e) {
            log.error("Error generating device statistics for tenant: {}", tenantId, e);
            stats.put("error", "Failed to generate statistics");
        }
        
        return stats;
    }
    
    /**
     * Validate device credentials
     */
    public boolean validateDeviceCredentials(String deviceId, String deviceToken) {
        try {
            String tenantId = TenantHeaderInterceptor.getCurrentTenant();
            Optional<RegisteredDevice> device = registeredDeviceRepository
                    .findByDeviceIdAndTenantId(deviceId, tenantId);
            
            if (device.isEmpty()) {
                log.warn("Device not found: {} for tenant: {}", deviceId, tenantId);
                return false;
            }
            
            RegisteredDevice registeredDevice = device.get();
            
            if (!registeredDevice.getIsActive()) {
                log.warn("Device is inactive: {} for tenant: {}", deviceId, tenantId);
                return false;
            }
            
            if (!deviceToken.equals(registeredDevice.getDeviceToken())) {
                log.warn("Invalid device token for device: {} for tenant: {}", deviceId, tenantId);
                return false;
            }
            
            log.debug("Device credentials validated successfully for device: {} tenant: {}", deviceId, tenantId);
            return true;
            
        } catch (Exception e) {
            log.error("Error validating device credentials for device: {} tenant: {}", deviceId, TenantHeaderInterceptor.getCurrentTenant(), e);
            return false;
        }
    }
    
    /**
     * Get device health status
     */
    public Map<String, Object> getDeviceHealthStatus(String deviceId) {
        Map<String, Object> health = new HashMap<>();
        
        try {
            String tenantId = TenantHeaderInterceptor.getCurrentTenant();
            Optional<RegisteredDevice> deviceOpt = registeredDeviceRepository
                    .findByDeviceIdAndTenantId(deviceId, tenantId);
            
            if (deviceOpt.isEmpty()) {
                health.put("status", "NOT_FOUND");
                health.put("message", "Device not found");
                return health;
            }
            
            RegisteredDevice device = deviceOpt.get();
            
            boolean isActive = device.getIsActive();
            boolean isRecentlySeen = device.isRecentlySeen(30); // 30 minutes
            boolean isStale = device.isStale(7); // 7 days
            
            health.put("deviceId", device.getDeviceId());
            health.put("deviceName", device.getDeviceName());
            health.put("deviceType", device.getDeviceType());
            health.put("isActive", isActive);
            health.put("isRecentlySeen", isRecentlySeen);
            health.put("isStale", isStale);
            health.put("lastSeenAt", device.getLastSeenAt());
            health.put("registeredAt", device.getRegisteredAt());
            health.put("status", isActive ? (isRecentlySeen ? "HEALTHY" : "INACTIVE") : "INACTIVE");
            
            log.debug("Generated health status for device: {} - Active: {}, RecentlySeen: {}, Stale: {}", 
                    deviceId, isActive, isRecentlySeen, isStale);
            
        } catch (Exception e) {
            log.error("Error generating device health status for device: {}", deviceId, e);
            health.put("status", "ERROR");
            health.put("message", "Failed to generate health status");
        }
        
        return health;
    }
}
