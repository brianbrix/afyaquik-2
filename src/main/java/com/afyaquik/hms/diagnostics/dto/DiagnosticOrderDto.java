package com.afyaquik.hms.diagnostics.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.afyaquik.hms.diagnostics.domain.DiagnosticOrderStatus;
import com.afyaquik.hms.diagnostics.domain.DiagnosticUrgency;

public class DiagnosticOrderDto {
    private Long id;
    private String orderNumber;
    private Long patientId;
    private String patientName;
    private Long queueItemId;
    private String ticketNumber;
    private String orderedBy;
    private String orderedByName;
    private DiagnosticOrderStatus status;
    private DiagnosticUrgency urgency;
    private String clinicalNotes;
    private String instructions;
    private LocalDateTime orderedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    private List<DiagnosticItemDto> diagnosticItems;
    private List<SampleDto> samples;
    private List<DiagnosticResultDto> results;
    
    // Constructors
    public DiagnosticOrderDto() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    
    public Long getQueueItemId() { return queueItemId; }
    public void setQueueItemId(Long queueItemId) { this.queueItemId = queueItemId; }
    
    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }
    
    public String getOrderedBy() { return orderedBy; }
    public void setOrderedBy(String orderedBy) { this.orderedBy = orderedBy; }
    
    public String getOrderedByName() { return orderedByName; }
    public void setOrderedByName(String orderedByName) { this.orderedByName = orderedByName; }
    
    public DiagnosticOrderStatus getStatus() { return status; }
    public void setStatus(DiagnosticOrderStatus status) { this.status = status; }
    
    public DiagnosticUrgency getUrgency() { return urgency; }
    public void setUrgency(DiagnosticUrgency urgency) { this.urgency = urgency; }
    
    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }
    
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    
    public LocalDateTime getOrderedAt() { return orderedAt; }
    public void setOrderedAt(LocalDateTime orderedAt) { this.orderedAt = orderedAt; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
    
    public List<DiagnosticItemDto> getDiagnosticItems() { return diagnosticItems; }
    public void setDiagnosticItems(List<DiagnosticItemDto> diagnosticItems) { this.diagnosticItems = diagnosticItems; }
    
    public List<SampleDto> getSamples() { return samples; }
    public void setSamples(List<SampleDto> samples) { this.samples = samples; }
    
    public List<DiagnosticResultDto> getResults() { return results; }
    public void setResults(List<DiagnosticResultDto> results) { this.results = results; }
}
