package com.afyaquik.hms.diagnostics.dto;

import java.time.LocalDateTime;

import com.afyaquik.hms.diagnostics.domain.SampleStatus;
import com.afyaquik.hms.diagnostics.domain.SampleType;

public class SampleDto {
    private Long id;
    private Long diagnosticOrderId;
    private Long diagnosticItemId;
    private String barcode;
    private SampleType sampleType;
    private SampleStatus status;
    private String collectedBy;
    private String collectedByName;
    private LocalDateTime collectedAt;
    private String receivedBy;
    private String receivedByName;
    private LocalDateTime receivedAt;
    private String notes;
    private String rejectionReason;
    
    // Constructors
    public SampleDto() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getDiagnosticOrderId() { return diagnosticOrderId; }
    public void setDiagnosticOrderId(Long diagnosticOrderId) { this.diagnosticOrderId = diagnosticOrderId; }
    
    public Long getDiagnosticItemId() { return diagnosticItemId; }
    public void setDiagnosticItemId(Long diagnosticItemId) { this.diagnosticItemId = diagnosticItemId; }
    
    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    
    public SampleType getSampleType() { return sampleType; }
    public void setSampleType(SampleType sampleType) { this.sampleType = sampleType; }
    
    public SampleStatus getStatus() { return status; }
    public void setStatus(SampleStatus status) { this.status = status; }
    
    public String getCollectedBy() { return collectedBy; }
    public void setCollectedBy(String collectedBy) { this.collectedBy = collectedBy; }
    
    public String getCollectedByName() { return collectedByName; }
    public void setCollectedByName(String collectedByName) { this.collectedByName = collectedByName; }
    
    public LocalDateTime getCollectedAt() { return collectedAt; }
    public void setCollectedAt(LocalDateTime collectedAt) { this.collectedAt = collectedAt; }
    
    public String getReceivedBy() { return receivedBy; }
    public void setReceivedBy(String receivedBy) { this.receivedBy = receivedBy; }
    
    public String getReceivedByName() { return receivedByName; }
    public void setReceivedByName(String receivedByName) { this.receivedByName = receivedByName; }
    
    public LocalDateTime getReceivedAt() { return receivedAt; }
    public void setReceivedAt(LocalDateTime receivedAt) { this.receivedAt = receivedAt; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
