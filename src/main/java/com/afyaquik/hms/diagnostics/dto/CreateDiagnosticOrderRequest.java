package com.afyaquik.hms.diagnostics.dto;

import java.util.List;

import com.afyaquik.hms.diagnostics.domain.DiagnosticUrgency;

public class CreateDiagnosticOrderRequest {
    private Long patientId;
    private Long queueItemId;
    private String clinicalNotes;
    private String instructions;
    private DiagnosticUrgency urgency;
    private List<DiagnosticItemRequest> diagnosticItems;
    
    // Constructors
    public CreateDiagnosticOrderRequest() {}
    
    // Getters and Setters
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    
    public Long getQueueItemId() { return queueItemId; }
    public void setQueueItemId(Long queueItemId) { this.queueItemId = queueItemId; }
    
    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }
    
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    
    public DiagnosticUrgency getUrgency() { return urgency; }
    public void setUrgency(DiagnosticUrgency urgency) { this.urgency = urgency; }
    
    public List<DiagnosticItemRequest> getDiagnosticItems() { return diagnosticItems; }
    public void setDiagnosticItems(List<DiagnosticItemRequest> diagnosticItems) { this.diagnosticItems = diagnosticItems; }
}
