package com.afyaquik.hms.auth.api;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.auth.dto.DeviceAuthRequest;
import com.afyaquik.hms.auth.dto.DeviceAuthResponse;
import com.afyaquik.hms.auth.dto.DeviceVerificationRequest;
import com.afyaquik.hms.auth.service.DeviceAuthService;
import com.afyaquik.hms.common.web.ApiResponse;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Controller for device authentication
 */
@RestController
@RequestMapping("/api/v1/auth/device")
public class DeviceAuthController {
    
    @Autowired
    private DeviceAuthService deviceAuthService;
    
    /**
     * Authenticate device
     */
    @PostMapping("/authenticate")
    public ResponseEntity<ApiResponse<DeviceAuthResponse>> authenticateDevice(
            @RequestBody DeviceAuthRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        
        try {
            // Get user information from authentication
            String tenantId = getTenantIdFromAuth(authentication);
            Long userId = getUserIdFromAuth(authentication);
            String ipAddress = getClientIpAddress(httpRequest);
            
            // Generate device fingerprint if not provided
            if (request.getDeviceFingerprint() == null) {
                request.setDeviceFingerprint(deviceAuthService.generateDeviceFingerprint(
                    request.getUserAgent(), request.getDeviceId()));
            }
            
            DeviceAuthResponse response = deviceAuthService.authenticateDevice(request, tenantId, userId, ipAddress);
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Authentication failed: " + e.getMessage()));
        }
    }
    
    /**
     * Verify device
     */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<DeviceAuthResponse>> verifyDevice(@RequestBody DeviceVerificationRequest request) {
        try {
            DeviceAuthResponse response = deviceAuthService.verifyDevice(request);
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Verification failed: " + e.getMessage()));
        }
    }
    
    /**
     * Validate device token
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateDeviceToken(
            @RequestParam String deviceId,
            @RequestParam String deviceToken) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean isValid = deviceAuthService.validateDeviceToken(deviceId, deviceToken);
            response.put("valid", isValid);
            
            if (isValid) {
                response.put("message", "Device token is valid");
            } else {
                response.put("message", "Device token is invalid or expired");
            }
            
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Validation failed: " + e.getMessage()));
        }
    }
    
    /**
     * Deactivate device
     */
    @PostMapping("/deactivate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deactivateDevice(
            @RequestParam String deviceId,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String tenantId = getTenantIdFromAuth(authentication);
            Long userId = getUserIdFromAuth(authentication);
            
            boolean success = deviceAuthService.deactivateDevice(deviceId, tenantId, userId);
            
            response.put("success", success);
            response.put("message", success ? "Device deactivated successfully" : "Failed to deactivate device");
            
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Deactivation failed: " + e.getMessage()));
        }
    }
    
    /**
     * Get user devices
     */
    @GetMapping("/user-devices")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserDevices(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String tenantId = getTenantIdFromAuth(authentication);
            Long userId = getUserIdFromAuth(authentication);
            
            var devices = deviceAuthService.getUserDevices(tenantId, userId);
            
            response.put("devices", devices);
            response.put("count", devices.size());
            
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to get user devices: " + e.getMessage()));
        }
    }
    
    /**
     * Get device information
     */
    @GetMapping("/info")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeviceInfo(@RequestParam String deviceId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            var device = deviceAuthService.getDevice(deviceId);
            
            if (device != null) {
                response.put("device", device);
                return ResponseEntity.ok(ApiResponse.success(response));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("Device not found"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to get device info: " + e.getMessage()));
        }
    }
    
    /**
     * Cleanup expired devices (admin endpoint)
     */
    @PostMapping("/cleanup")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cleanupExpiredDevices() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            deviceAuthService.cleanupExpiredDevices();
            
            response.put("message", "Expired devices cleaned up successfully");
            
            return ResponseEntity.ok(ApiResponse.success(response));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Cleanup failed: " + e.getMessage()));
        }
    }
    
    /**
     * Get tenant ID from authentication
     */
    private String getTenantIdFromAuth(Authentication authentication) {
        // This would depend on your authentication implementation
        // For now, return a default tenant ID
        return "clinic-a"; // You might want to extract this from the JWT token or user details
    }
    
    /**
     * Get user ID from authentication
     */
    private Long getUserIdFromAuth(Authentication authentication) {
        // This would depend on your authentication implementation
        // For now, return a default user ID
        return 1L; // You might want to extract this from the JWT token or user details
    }
    
    /**
     * Get client IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
