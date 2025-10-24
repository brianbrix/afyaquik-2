package com.afyaquik.hms.audit.dto;

import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for offline audit entries
 */
public class OfflineAuditEntryDto {
    
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("userId")
    private Long userId;
    
    @JsonProperty("username")
    private String username;
    
    @JsonProperty("tenantId")
    private String tenantId;
    
    @JsonProperty("action")
    private String action;
    
    @JsonProperty("resourceType")
    private String resourceType;
    
    @JsonProperty("resourceId")
    private Long resourceId;
    
    @JsonProperty("resourceName")
    private String resourceName;
    
    @JsonProperty("oldValues")
    private Map<String, Object> oldValues;
    
    @JsonProperty("newValues")
    private Map<String, Object> newValues;
    
    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
    
    @JsonProperty("offline")
    private Boolean offline;
    
    @JsonProperty("deviceId")
    private String deviceId;
    
    @JsonProperty("sessionId")
    private String sessionId;
    
    @JsonProperty("ipAddress")
    private String ipAddress;
    
    @JsonProperty("userAgent")
    private String userAgent;
    
    @JsonProperty("success")
    private Boolean success;
    
    @JsonProperty("errorMessage")
    private String errorMessage;
    
    @JsonProperty("metadata")
    private Map<String, Object> metadata;
    
    // Constructors
    public OfflineAuditEntryDto() {}
    
    public OfflineAuditEntryDto(String id, Long userId, String username, String tenantId, 
                               String action, LocalDateTime timestamp, Boolean offline, Boolean success) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.tenantId = tenantId;
        this.action = action;
        this.timestamp = timestamp;
        this.offline = offline;
        this.success = success;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getTenantId() {
        return tenantId;
    }
    
    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }
    
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
    
    public String getResourceType() {
        return resourceType;
    }
    
    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }
    
    public Long getResourceId() {
        return resourceId;
    }
    
    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }
    
    public String getResourceName() {
        return resourceName;
    }
    
    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }
    
    public Map<String, Object> getOldValues() {
        return oldValues;
    }
    
    public void setOldValues(Map<String, Object> oldValues) {
        this.oldValues = oldValues;
    }
    
    public Map<String, Object> getNewValues() {
        return newValues;
    }
    
    public void setNewValues(Map<String, Object> newValues) {
        this.newValues = newValues;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public Boolean getOffline() {
        return offline;
    }
    
    public void setOffline(Boolean offline) {
        this.offline = offline;
    }
    
    public String getDeviceId() {
        return deviceId;
    }
    
    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
    
    public Boolean getSuccess() {
        return success;
    }
    
    public void setSuccess(Boolean success) {
        this.success = success;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public Map<String, Object> getMetadata() {
        return metadata;
    }
    
    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
}
