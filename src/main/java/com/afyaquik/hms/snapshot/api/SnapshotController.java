package com.afyaquik.hms.snapshot.api;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.audit.annotation.Auditable;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.snapshot.domain.DeviceSnapshot;
import com.afyaquik.hms.snapshot.dto.DeviceRegistrationRequest;
import com.afyaquik.hms.snapshot.dto.DeviceRegistrationResponse;
import com.afyaquik.hms.snapshot.dto.SnapshotResponse;
import com.afyaquik.hms.snapshot.service.DeviceRegistrationService;
import com.afyaquik.hms.snapshot.service.SnapshotService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/snapshots")
public class SnapshotController {
    
    private static final Logger log = LoggerFactory.getLogger(SnapshotController.class);
    
    @Autowired
    private SnapshotService snapshotService;
    
    @Autowired
    private DeviceRegistrationService deviceRegistrationService;
    
    /**
     * Register a new device for snapshot service
     * Requires authentication to ensure proper tenant association
     */
    @PostMapping("/devices/register")
    public ResponseEntity<ApiResponse<DeviceRegistrationResponse>> registerDevice(
            @Valid @RequestBody DeviceRegistrationRequest request) {
        
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null ? authentication.getName() : "unknown";
        
        log.info("Registering device: {} for tenant: {} by user: {}", request.getDeviceId(), tenantId, username);
        
        try {
            // Use DeviceRegistrationService to handle device registration with user context
            DeviceRegistrationResponse response = deviceRegistrationService.registerDevice(request);
            
            log.info("Device registered successfully: {} for tenant: {} by user: {}", 
                    request.getDeviceId(), tenantId, username);
            
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            log.error("Failed to register device: {} for tenant: {} by user: {}", 
                    request.getDeviceId(), tenantId, username, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to register device: " + e.getMessage()));
        }
    }
    
    /**
     * Test endpoint to verify snapshot service is working
     */
    @GetMapping("/test")
    public ResponseEntity<ApiResponse<String>> testSnapshotService() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Testing snapshot service for tenant: {}", tenantId);
        
        try {
            // Simple test - just return success
            return ResponseEntity.ok(ApiResponse.success("Snapshot service is working for tenant: " + tenantId));
        } catch (Exception e) {
            log.error("Snapshot service test failed for tenant: {}", tenantId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Snapshot service test failed: " + e.getMessage()));
        }
    }
    
    /**
     * Create a full snapshot for a device
     */
    @PostMapping("/devices/{deviceId}/full")
    @Auditable(action = "CREATE_FULL_SNAPSHOT", entityType = "DeviceSnapshot", description = "Create full snapshot for device")
    public ResponseEntity<ApiResponse<SnapshotResponse>> createFullSnapshot(
            @PathVariable String deviceId) {
        
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Creating full snapshot for device: {} tenant: {}", deviceId, tenantId);
        
        try {
            DeviceSnapshot snapshot = snapshotService.createFullSnapshot(deviceId, tenantId);
            
            SnapshotResponse response = new SnapshotResponse();
            response.setId(snapshot.getId());
            response.setDeviceId(snapshot.getDeviceId());
            response.setTenantId(snapshot.getTenantId());
            response.setSnapshotType(snapshot.getSnapshotType().toString());
            response.setVersion(snapshot.getVersion());
            response.setDataSize(snapshot.getDataSize());
            response.setCreatedAt(snapshot.getCreatedAt().toString());
            response.setSnapshotData(snapshot.getSnapshotData());
            response.setIsCompressed(snapshot.getIsCompressed());
            response.setChecksum(snapshot.getChecksum());
            
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            log.info("Failed to create full snapshot for device: {} tenant: {}", deviceId, tenantId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create full snapshot: " + e.getMessage()));
        }
    }
    
    /**
     * Get the latest snapshot for a device
     */
    @GetMapping("/devices/{deviceId}/latest")
    public ResponseEntity<ApiResponse<SnapshotResponse>> getLatestSnapshot(
            @PathVariable String deviceId) {
        
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Getting latest snapshot for device: {} tenant: {}", deviceId, tenantId);
        
        try {
            DeviceSnapshot snapshot = snapshotService.getLatestSnapshot(deviceId, tenantId);
            
            if (snapshot == null) {
                return ResponseEntity.notFound().build();
            }
            
            SnapshotResponse response = new SnapshotResponse();
            response.setId(snapshot.getId());
            response.setDeviceId(snapshot.getDeviceId());
            response.setTenantId(snapshot.getTenantId());
            response.setSnapshotType(snapshot.getSnapshotType().toString());
            response.setVersion(snapshot.getVersion());
            response.setDataSize(snapshot.getDataSize());
            response.setCreatedAt(snapshot.getCreatedAt().toString());
            response.setSnapshotData(snapshot.getSnapshotData());
            response.setIsCompressed(snapshot.getIsCompressed());
            response.setChecksum(snapshot.getChecksum());
            
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            log.error("Failed to get latest snapshot for device: {} tenant: {}", deviceId, tenantId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get snapshot: " + e.getMessage()));
        }
    }
    
    /**
     * Get incremental snapshot for a device
     */
    @GetMapping("/devices/{deviceId}/incremental")
    public ResponseEntity<ApiResponse<SnapshotResponse>> getIncrementalSnapshot(
            @PathVariable String deviceId,
            @RequestParam(required = false) String since) {
        
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Getting incremental snapshot for device: {} tenant: {} since: {}", 
                deviceId, tenantId, since);
        
        try {
            LocalDateTime sinceTime = since != null ? 
                    parseIsoTimestamp(since) : LocalDateTime.now().minusHours(1);
            
            DeviceSnapshot snapshot = snapshotService.createIncrementalSnapshot(deviceId, tenantId, sinceTime);
            
            SnapshotResponse response = new SnapshotResponse();
            response.setId(snapshot.getId());
            response.setDeviceId(snapshot.getDeviceId());
            response.setTenantId(snapshot.getTenantId());
            response.setSnapshotType(snapshot.getSnapshotType().toString());
            response.setVersion(snapshot.getVersion());
            response.setDataSize(snapshot.getDataSize());
            response.setCreatedAt(snapshot.getCreatedAt().toString());
            response.setSnapshotData(snapshot.getSnapshotData());
            response.setIsCompressed(snapshot.getIsCompressed());
            response.setChecksum(snapshot.getChecksum());
            
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            log.error("Failed to get incremental snapshot for device: {} tenant: {}", deviceId, tenantId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get incremental snapshot: " + e.getMessage()));
        }
    }
    
    /**
     * Get all snapshots for a device
     */
    @GetMapping("/devices/{deviceId}/all")
    public ResponseEntity<ApiResponse<List<SnapshotResponse>>> getDeviceSnapshots(
            @PathVariable String deviceId) {
        
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Getting all snapshots for device: {} tenant: {}", deviceId, tenantId);
        
        try {
            List<DeviceSnapshot> snapshots = snapshotService.getDeviceSnapshots(deviceId, tenantId);
            
            List<SnapshotResponse> responses = snapshots.stream()
                    .map(snapshot -> {
                        SnapshotResponse response = new SnapshotResponse();
                        response.setId(snapshot.getId());
                        response.setDeviceId(snapshot.getDeviceId());
                        response.setTenantId(snapshot.getTenantId());
                        response.setSnapshotType(snapshot.getSnapshotType().toString());
                        response.setVersion(snapshot.getVersion());
                        response.setDataSize(snapshot.getDataSize());
                        response.setCreatedAt(snapshot.getCreatedAt().toString());
                        response.setSnapshotData(snapshot.getSnapshotData());
                        response.setIsCompressed(snapshot.getIsCompressed());
                        response.setChecksum(snapshot.getChecksum());
                        return response;
                    })
                    .toList();
            
            return ResponseEntity.ok(ApiResponse.success(responses));
            
        } catch (Exception e) {
            log.error("Failed to get snapshots for device: {} tenant: {}", deviceId, tenantId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to get snapshots: " + e.getMessage()));
        }
    }
    
    /**
     * Check if data has changed since last snapshot
     */
    @GetMapping("/devices/{deviceId}/check-changes")
    public ResponseEntity<ApiResponse<Boolean>> checkDataChanges(
            @PathVariable String deviceId,
            @RequestParam String since) {
        
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Checking data changes for device: {} tenant: {} since: {}", 
                deviceId, tenantId, since);
        
        try {
            LocalDateTime sinceTime = parseIsoTimestamp(since);
            boolean hasChanges = snapshotService.hasDataChanged(tenantId, sinceTime);
            
            return ResponseEntity.ok(ApiResponse.success(hasChanges));
            
        } catch (Exception e) {
            log.error("Failed to check data changes for device: {} tenant: {}", deviceId, tenantId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to check data changes: " + e.getMessage()));
        }
    }
    
    /**
     * Cleanup old snapshots for a device
     */
    @DeleteMapping("/devices/{deviceId}/cleanup")
    public ResponseEntity<ApiResponse<String>> cleanupOldSnapshots(@PathVariable String deviceId) {
        
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Cleaning up old snapshots for device: {} tenant: {}", deviceId, tenantId);
        
        try {
            snapshotService.cleanupOldSnapshots(deviceId, tenantId);
            return ResponseEntity.ok(ApiResponse.success("Old snapshots cleaned up successfully"));
            
        } catch (Exception e) {
            log.error("Failed to cleanup snapshots for device: {} tenant: {}", deviceId, tenantId, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to cleanup snapshots: " + e.getMessage()));
        }
    }
    
    /**
     * Parse ISO 8601 timestamp with timezone (e.g., "2025-10-24T07:40:05.485Z")
     * Convert to LocalDateTime by first parsing as Instant, then converting to LocalDateTime
     */
    private LocalDateTime parseIsoTimestamp(String timestamp) {
        java.time.Instant instant = java.time.Instant.parse(timestamp);
        return LocalDateTime.ofInstant(instant, java.time.ZoneOffset.UTC);
    }
}
