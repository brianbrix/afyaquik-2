package com.afyaquik.hms.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for device authentication request
 */
public class DeviceAuthRequest {
    
    @JsonProperty("deviceId")
    private String deviceId;
    
    @JsonProperty("deviceName")
    private String deviceName;
    
    @JsonProperty("deviceType")
    private String deviceType;
    
    @JsonProperty("publicKey")
    private String publicKey;
    
    @JsonProperty("timestamp")
    private Long timestamp;
    
    @JsonProperty("deviceFingerprint")
    private String deviceFingerprint;
    
    @JsonProperty("userAgent")
    private String userAgent;
    
    @JsonProperty("ipAddress")
    private String ipAddress;
    
    // Constructors
    public DeviceAuthRequest() {}
    
    public DeviceAuthRequest(String deviceId, String deviceName, String deviceType, 
                            String publicKey, Long timestamp) {
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.deviceType = deviceType;
        this.publicKey = publicKey;
        this.timestamp = timestamp;
    }
    
    // Getters and Setters
    public String getDeviceId() {
        return deviceId;
    }
    
    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
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
    
    public String getPublicKey() {
        return publicKey;
    }
    
    public void setPublicKey(String publicKey) {
        this.publicKey = publicKey;
    }
    
    public Long getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getDeviceFingerprint() {
        return deviceFingerprint;
    }
    
    public void setDeviceFingerprint(String deviceFingerprint) {
        this.deviceFingerprint = deviceFingerprint;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
}
