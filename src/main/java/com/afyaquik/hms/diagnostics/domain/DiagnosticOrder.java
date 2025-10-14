package com.afyaquik.hms.diagnostics.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.afyaquik.hms.common.domain.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "diagnostic_orders")
public class DiagnosticOrder extends BaseEntity {
    
    @Column(nullable = false, unique = true)
    private String orderNumber;
    
    @Column(nullable = false)
    private Long patientId;
    
    @Column(nullable = false)
    private Long queueItemId;
    
    @Column(nullable = false)
    private String orderedBy;
    
    @Column(nullable = false)
    private String orderedByName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiagnosticOrderStatus status = DiagnosticOrderStatus.ORDERED;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiagnosticUrgency urgency = DiagnosticUrgency.ROUTINE;
    
    @Column(columnDefinition = "TEXT")
    private String clinicalNotes;
    
    @Column(columnDefinition = "TEXT")
    private String instructions;
    
    private LocalDateTime orderedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    
    @OneToMany(mappedBy = "diagnosticOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DiagnosticItem> diagnosticItems = new ArrayList<>();
    
    @OneToMany(mappedBy = "diagnosticOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Sample> samples = new ArrayList<>();
    
    @OneToMany(mappedBy = "diagnosticOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DiagnosticResult> results = new ArrayList<>();
    
    // Constructors
    public DiagnosticOrder() {}
    
    public DiagnosticOrder(String orderNumber, Long patientId, Long queueItemId, String orderedBy, String orderedByName) {
        this.orderNumber = orderNumber;
        this.patientId = patientId;
        this.queueItemId = queueItemId;
        this.orderedBy = orderedBy;
        this.orderedByName = orderedByName;
        this.orderedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    
    public Long getQueueItemId() { return queueItemId; }
    public void setQueueItemId(Long queueItemId) { this.queueItemId = queueItemId; }
    
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
    
    public List<DiagnosticItem> getDiagnosticItems() { return diagnosticItems; }
    public void setDiagnosticItems(List<DiagnosticItem> diagnosticItems) { this.diagnosticItems = diagnosticItems; }
    
    public List<Sample> getSamples() { return samples; }
    public void setSamples(List<Sample> samples) { this.samples = samples; }
    
    public List<DiagnosticResult> getResults() { return results; }
    public void setResults(List<DiagnosticResult> results) { this.results = results; }
}
