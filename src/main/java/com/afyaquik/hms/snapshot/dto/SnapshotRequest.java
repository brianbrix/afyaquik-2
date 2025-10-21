package com.afyaquik.hms.snapshot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SnapshotRequest {
    
    @NotBlank(message = "Device ID is required")
    @Size(max = 100, message = "Device ID must not exceed 100 characters")
    private String deviceId;
    
    @Size(max = 50, message = "Snapshot type must not exceed 50 characters")
    private String snapshotType;
    
    private Boolean includePatients = true;
    private Boolean includeStaff = true;
    private Boolean includeDepartments = true;
    private Boolean includeAppointments = true;
    private Boolean includeMedications = true;
    private Boolean includeQueueItems = true;
    
    // Constructors
    public SnapshotRequest() {}
    
    public SnapshotRequest(String deviceId, String snapshotType) {
        this.deviceId = deviceId;
        this.snapshotType = snapshotType;
    }
    
    // Getters and Setters
    public String getDeviceId() {
        return deviceId;
    }
    
    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }
    
    public String getSnapshotType() {
        return snapshotType;
    }
    
    public void setSnapshotType(String snapshotType) {
        this.snapshotType = snapshotType;
    }
    
    public Boolean getIncludePatients() {
        return includePatients;
    }
    
    public void setIncludePatients(Boolean includePatients) {
        this.includePatients = includePatients;
    }
    
    public Boolean getIncludeStaff() {
        return includeStaff;
    }
    
    public void setIncludeStaff(Boolean includeStaff) {
        this.includeStaff = includeStaff;
    }
    
    public Boolean getIncludeDepartments() {
        return includeDepartments;
    }
    
    public void setIncludeDepartments(Boolean includeDepartments) {
        this.includeDepartments = includeDepartments;
    }
    
    public Boolean getIncludeAppointments() {
        return includeAppointments;
    }
    
    public void setIncludeAppointments(Boolean includeAppointments) {
        this.includeAppointments = includeAppointments;
    }
    
    public Boolean getIncludeMedications() {
        return includeMedications;
    }
    
    public void setIncludeMedications(Boolean includeMedications) {
        this.includeMedications = includeMedications;
    }
    
    public Boolean getIncludeQueueItems() {
        return includeQueueItems;
    }
    
    public void setIncludeQueueItems(Boolean includeQueueItems) {
        this.includeQueueItems = includeQueueItems;
    }
    
    @Override
    public String toString() {
        return "SnapshotRequest{" +
                "deviceId='" + deviceId + '\'' +
                ", snapshotType='" + snapshotType + '\'' +
                ", includePatients=" + includePatients +
                ", includeStaff=" + includeStaff +
                ", includeDepartments=" + includeDepartments +
                ", includeAppointments=" + includeAppointments +
                ", includeMedications=" + includeMedications +
                ", includeQueueItems=" + includeQueueItems +
                '}';
    }
}
