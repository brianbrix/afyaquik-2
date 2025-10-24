package com.afyaquik.hms.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for device verification request
 */
public class DeviceVerificationRequest {
    
    @JsonProperty("deviceId")
    private String deviceId;
    
    @JsonProperty("deviceToken")
    private String deviceToken;
    
    @JsonProperty("challengeResponse")
    private String challengeResponse;
    
    @JsonProperty("verificationCode")
    private String verificationCode;
    
    @JsonProperty("biometricData")
    private String biometricData;
    
    @JsonProperty("timestamp")
    private Long timestamp;
    
    // Constructors
    public DeviceVerificationRequest() {}
    
    public DeviceVerificationRequest(String deviceId, String deviceToken, String challengeResponse) {
        this.deviceId = deviceId;
        this.deviceToken = deviceToken;
        this.challengeResponse = challengeResponse;
    }
    
    // Getters and Setters
    public String getDeviceId() {
        return deviceId;
    }
    
    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }
    
    public String getDeviceToken() {
        return deviceToken;
    }
    
    public void setDeviceToken(String deviceToken) {
        this.deviceToken = deviceToken;
    }
    
    public String getChallengeResponse() {
        return challengeResponse;
    }
    
    public void setChallengeResponse(String challengeResponse) {
        this.challengeResponse = challengeResponse;
    }
    
    public String getVerificationCode() {
        return verificationCode;
    }
    
    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }
    
    public String getBiometricData() {
        return biometricData;
    }
    
    public void setBiometricData(String biometricData) {
        this.biometricData = biometricData;
    }
    
    public Long getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }
}
