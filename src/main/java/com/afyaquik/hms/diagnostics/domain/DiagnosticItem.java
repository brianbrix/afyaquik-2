package com.afyaquik.hms.diagnostics.domain;

import java.math.BigDecimal;
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
@Table(name = "diagnostic_items")
public class DiagnosticItem extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagnostic_order_id", nullable = false)
    private DiagnosticOrder diagnosticOrder;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_catalog_id", nullable = false)
    private TestCatalog testCatalog;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiagnosticItemStatus status = DiagnosticItemStatus.ORDERED;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal cost;
    
    @Column(nullable = false)
    private String orderedBy;
    
    @Column(nullable = false)
    private String orderedByName;
    
    @OneToMany(mappedBy = "diagnosticItem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Sample> samples = new ArrayList<>();
    
    @OneToMany(mappedBy = "diagnosticItem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DiagnosticResult> results = new ArrayList<>();
    
    // Constructors
    public DiagnosticItem() {}
    
    public DiagnosticItem(DiagnosticOrder diagnosticOrder, TestCatalog testCatalog, String orderedBy, String orderedByName) {
        this.diagnosticOrder = diagnosticOrder;
        this.testCatalog = testCatalog;
        this.orderedBy = orderedBy;
        this.orderedByName = orderedByName;
    }
    
    // Getters and Setters
    public DiagnosticOrder getDiagnosticOrder() { return diagnosticOrder; }
    public void setDiagnosticOrder(DiagnosticOrder diagnosticOrder) { this.diagnosticOrder = diagnosticOrder; }
    
    public TestCatalog getTestCatalog() { return testCatalog; }
    public void setTestCatalog(TestCatalog testCatalog) { this.testCatalog = testCatalog; }
    
    public DiagnosticItemStatus getStatus() { return status; }
    public void setStatus(DiagnosticItemStatus status) { this.status = status; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { this.cost = cost; }
    
    public String getOrderedBy() { return orderedBy; }
    public void setOrderedBy(String orderedBy) { this.orderedBy = orderedBy; }
    
    public String getOrderedByName() { return orderedByName; }
    public void setOrderedByName(String orderedByName) { this.orderedByName = orderedByName; }
    
    public List<Sample> getSamples() { return samples; }
    public void setSamples(List<Sample> samples) { this.samples = samples; }
    
    public List<DiagnosticResult> getResults() { return results; }
    public void setResults(List<DiagnosticResult> results) { this.results = results; }
}
