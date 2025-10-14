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
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "samples")
public class Sample extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagnostic_order_id", nullable = false)
    private DiagnosticOrder diagnosticOrder;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagnostic_item_id", nullable = false)
    private DiagnosticItem diagnosticItem;
    
    @Column(nullable = false, unique = true)
    private String barcode;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SampleType sampleType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SampleStatus status = SampleStatus.PENDING;
    
    @Column(nullable = false)
    private String collectedBy;
    
    @Column(nullable = false)
    private String collectedByName;
    
    private LocalDateTime collectedAt;
    
    @Column(nullable = false)
    private String receivedBy;
    
    @Column(nullable = false)
    private String receivedByName;
    
    private LocalDateTime receivedAt;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
    
    @OneToMany(mappedBy = "sample", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DiagnosticResult> results = new ArrayList<>();
    
    // Constructors
    public Sample() {}
    
    public Sample(DiagnosticOrder diagnosticOrder, DiagnosticItem diagnosticItem, String barcode, 
                  SampleType sampleType, String collectedBy, String collectedByName) {
        this.diagnosticOrder = diagnosticOrder;
        this.diagnosticItem = diagnosticItem;
        this.barcode = barcode;
        this.sampleType = sampleType;
        this.collectedBy = collectedBy;
        this.collectedByName = collectedByName;
    }
    
    // Getters and Setters
    public DiagnosticOrder getDiagnosticOrder() { return diagnosticOrder; }
    public void setDiagnosticOrder(DiagnosticOrder diagnosticOrder) { this.diagnosticOrder = diagnosticOrder; }
    
    public DiagnosticItem getDiagnosticItem() { return diagnosticItem; }
    public void setDiagnosticItem(DiagnosticItem diagnosticItem) { this.diagnosticItem = diagnosticItem; }
    
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
    
    public List<DiagnosticResult> getResults() { return results; }
    public void setResults(List<DiagnosticResult> results) { this.results = results; }
}
