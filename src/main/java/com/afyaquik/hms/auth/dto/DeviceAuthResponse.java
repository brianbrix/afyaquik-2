package com.afyaquik.hms.auth.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for device authentication response
 */
public class DeviceAuthResponse {
    
    @JsonProperty("success")
    private Boolean success;
    
    @JsonProperty("deviceToken")
    private String deviceToken;
    
    @JsonProperty("expiresAt")
    private LocalDateTime expiresAt;
    
    @JsonProperty("serverPublicKey")
    private String serverPublicKey;
    
    @JsonProperty("challenge")
    private String challenge;
    
    @JsonProperty("error")
    private String error;
    
    @JsonProperty("requiresVerification")
    private Boolean requiresVerification;
    
    @JsonProperty("verificationMethod")
    private String verificationMethod;
    
    // Constructors
    public DeviceAuthResponse() {}
    
    public DeviceAuthResponse(Boolean success, String deviceToken, LocalDateTime expiresAt) {
        this.success = success;
        this.deviceToken = deviceToken;
        this.expiresAt = expiresAt;
    }
    
    public DeviceAuthResponse(Boolean success, String error) {
        this.success = success;
        this.error = error;
    }
    
    // Getters and Setters
    public Boolean getSuccess() {
        return success;
    }
    
    public void setSuccess(Boolean success) {
        this.success = success;
    }
    
    public String getDeviceToken() {
        return deviceToken;
    }
    
    public void setDeviceToken(String deviceToken) {
        this.deviceToken = deviceToken;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public String getServerPublicKey() {
        return serverPublicKey;
    }
    
    public void setServerPublicKey(String serverPublicKey) {
        this.serverPublicKey = serverPublicKey;
    }
    
    public String getChallenge() {
        return challenge;
    }
    
    public void setChallenge(String challenge) {
        this.challenge = challenge;
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
    
    public Boolean getRequiresVerification() {
        return requiresVerification;
    }
    
    public void setRequiresVerification(Boolean requiresVerification) {
        this.requiresVerification = requiresVerification;
    }
    
    public String getVerificationMethod() {
        return verificationMethod;
    }
    
    public void setVerificationMethod(String verificationMethod) {
        this.verificationMethod = verificationMethod;
    }
}

