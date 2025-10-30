package com.afyaquik.hms.auth.service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.auth.domain.Device;
import com.afyaquik.hms.auth.dto.DeviceAuthRequest;
import com.afyaquik.hms.auth.dto.DeviceAuthResponse;
import com.afyaquik.hms.auth.dto.DeviceVerificationRequest;
import com.afyaquik.hms.auth.repository.DeviceRepository;

/**
 * Service for device authentication
 */
@Service
@Transactional
public class DeviceAuthService {
    
    @Autowired
    private DeviceRepository deviceRepository;
    
    private final SecureRandom secureRandom = new SecureRandom();
    
    /**
     * Authenticate device
     */
    public DeviceAuthResponse authenticateDevice(DeviceAuthRequest request, String tenantId, Long userId, String ipAddress) {
        try {
            // Validate request
            if (request.getDeviceId() == null || request.getPublicKey() == null) {
                return new DeviceAuthResponse(false, "Invalid device authentication request");
            }
            
            // Check if device already exists
            Optional<Device> existingDevice = deviceRepository.findByDeviceId(request.getDeviceId());
            
            if (existingDevice.isPresent()) {
                Device device = existingDevice.get();
                
                // Check if device is active
                if (!device.getIsActive()) {
                    return new DeviceAuthResponse(false, "Device is deactivated");
                }
                
                // Check if device belongs to the same user and tenant
                if (!device.getTenantId().equals(tenantId) || !device.getUserId().equals(userId)) {
                    return new DeviceAuthResponse(false, "Device does not belong to this user");
                }
                
                // Update device information
                device.setDeviceName(request.getDeviceName());
                device.setDeviceType(request.getDeviceType());
                device.setPublicKey(request.getPublicKey());
                device.setDeviceFingerprint(request.getDeviceFingerprint());
                device.setUserAgent(request.getUserAgent());
                device.setIpAddress(ipAddress);
                device.setLastSeen(LocalDateTime.now());
                
                // Generate new device token
                String deviceToken = generateDeviceToken();
                device.setDeviceToken(deviceToken);
                device.setTokenExpiresAt(LocalDateTime.now().plusDays(30)); // 30 days expiry
                
                deviceRepository.save(device);
                
                return new DeviceAuthResponse(true, deviceToken, device.getTokenExpiresAt());
                
            } else {
                // Create new device
                Device newDevice = new Device();
                newDevice.setDeviceId(request.getDeviceId());
                newDevice.setDeviceName(request.getDeviceName());
                newDevice.setDeviceType(request.getDeviceType());
                newDevice.setPublicKey(request.getPublicKey());
                newDevice.setDeviceFingerprint(request.getDeviceFingerprint());
                newDevice.setUserAgent(request.getUserAgent());
                newDevice.setIpAddress(ipAddress);
                newDevice.setTenantId(tenantId);
                newDevice.setUserId(userId);
                newDevice.setIsVerified(false); // New devices require verification
                newDevice.setIsActive(true);
                newDevice.setLastSeen(LocalDateTime.now());
                
                // Generate device token
                String deviceToken = generateDeviceToken();
                newDevice.setDeviceToken(deviceToken);
                newDevice.setTokenExpiresAt(LocalDateTime.now().plusDays(30));
                
                deviceRepository.save(newDevice);
                
                // For new devices, require verification
                DeviceAuthResponse response = new DeviceAuthResponse(true, deviceToken, newDevice.getTokenExpiresAt());
                response.setRequiresVerification(true);
                response.setVerificationMethod("CHALLENGE_RESPONSE");
                response.setChallenge(generateChallenge());
                
                return response;
            }
            
        } catch (Exception e) {
            return new DeviceAuthResponse(false, "Device authentication failed: " + e.getMessage());
        }
    }
    
    /**
     * Verify device
     */
    public DeviceAuthResponse verifyDevice(DeviceVerificationRequest request) {
        try {
            // Find device
            Optional<Device> deviceOpt = deviceRepository.findByDeviceId(request.getDeviceId());
            if (!deviceOpt.isPresent()) {
                return new DeviceAuthResponse(false, "Device not found");
            }
            
            Device device = deviceOpt.get();
            
            // Check if device token matches
            if (!device.getDeviceToken().equals(request.getDeviceToken())) {
                return new DeviceAuthResponse(false, "Invalid device token");
            }
            
            // Verify challenge response (simplified - in real implementation, use cryptographic verification)
            if (request.getChallengeResponse() != null) {
                // In a real implementation, verify the cryptographic challenge response
                // For now, we'll accept any non-null response
                device.setIsVerified(true);
                device.setLastSeen(LocalDateTime.now());
                deviceRepository.save(device);
                
                return new DeviceAuthResponse(true, device.getDeviceToken(), device.getTokenExpiresAt());
            }
            
            // Verify verification code (if provided)
            if (request.getVerificationCode() != null) {
                // In a real implementation, verify the verification code
                // For now, we'll accept any non-null code
                device.setIsVerified(true);
                device.setLastSeen(LocalDateTime.now());
                deviceRepository.save(device);
                
                return new DeviceAuthResponse(true, device.getDeviceToken(), device.getTokenExpiresAt());
            }
            
            return new DeviceAuthResponse(false, "No valid verification method provided");
            
        } catch (Exception e) {
            return new DeviceAuthResponse(false, "Device verification failed: " + e.getMessage());
        }
    }
    
    /**
     * Validate device token
     */
    public boolean validateDeviceToken(String deviceId, String deviceToken) {
        try {
            Optional<Device> deviceOpt = deviceRepository.findByDeviceId(deviceId);
            if (!deviceOpt.isPresent()) {
                return false;
            }
            
            Device device = deviceOpt.get();
            
            // Check if device is active
            if (!device.getIsActive()) {
                return false;
            }
            
            // Check if device is verified
            if (!device.getIsVerified()) {
                return false;
            }
            
            // Check if token matches
            if (!device.getDeviceToken().equals(deviceToken)) {
                return false;
            }
            
            // Check if token is expired
            if (device.getTokenExpiresAt().isBefore(LocalDateTime.now())) {
                return false;
            }
            
            // Update last seen
            device.setLastSeen(LocalDateTime.now());
            deviceRepository.save(device);
            
            return true;
            
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Deactivate device
     */
    public boolean deactivateDevice(String deviceId, String tenantId, Long userId) {
        try {
            Optional<Device> deviceOpt = deviceRepository.findByDeviceId(deviceId);
            if (!deviceOpt.isPresent()) {
                return false;
            }
            
            Device device = deviceOpt.get();
            
            // Check if device belongs to the user
            if (!device.getTenantId().equals(tenantId) || !device.getUserId().equals(userId)) {
                return false;
            }
            
            device.setIsActive(false);
            device.setLastSeen(LocalDateTime.now());
            deviceRepository.save(device);
            
            return true;
            
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Get device information
     */
    public Device getDevice(String deviceId) {
        return deviceRepository.findByDeviceId(deviceId).orElse(null);
    }
    
    /**
     * Get user devices
     */
    public java.util.List<Device> getUserDevices(String tenantId, Long userId) {
        return deviceRepository.findByTenantIdAndUserId(tenantId, userId);
    }
    
    /**
     * Clean up expired devices
     */
    public void cleanupExpiredDevices() {
        LocalDateTime now = LocalDateTime.now();
        java.util.List<Device> expiredDevices = deviceRepository.findDevicesWithExpiredTokens(now);
        
        for (Device device : expiredDevices) {
            device.setIsActive(false);
            deviceRepository.save(device);
        }
    }
    
    /**
     * Generate device token
     */
    private String generateDeviceToken() {
        String uuid = UUID.randomUUID().toString();
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = String.valueOf(secureRandom.nextInt(1000000));
        return "device_token_" + uuid + "_" + timestamp + "_" + random;
    }
    
    /**
     * Generate challenge for device verification
     */
    private String generateChallenge() {
        byte[] challenge = new byte[32];
        secureRandom.nextBytes(challenge);
        return Base64.getEncoder().encodeToString(challenge);
    }
    
    /**
     * Generate device fingerprint
     */
    public String generateDeviceFingerprint(String userAgent, String deviceId) {
        try {
            String data = userAgent + "_" + deviceId + "_" + System.currentTimeMillis();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to generate device fingerprint", e);
        }
    }
}

