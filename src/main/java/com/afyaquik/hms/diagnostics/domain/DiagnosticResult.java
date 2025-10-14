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
@Table(name = "diagnostic_results")
public class DiagnosticResult extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagnostic_order_id", nullable = false)
    private DiagnosticOrder diagnosticOrder;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diagnostic_item_id", nullable = false)
    private DiagnosticItem diagnosticItem;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sample_id")
    private Sample sample;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "result_template_id")
    private ResultTemplate resultTemplate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResultStatus status = ResultStatus.PENDING;
    
    @Column(name = "field_name")
    private String fieldName;
    
    @Column(name = "field_label")
    private String fieldLabel;
    
    @Column(name = "test_catalog_id")
    private Long testCatalogId;
    
    @Column(columnDefinition = "TEXT")
    private String resultValue;
    
    @Column(columnDefinition = "TEXT")
    private String resultText;
    
    @Column(columnDefinition = "TEXT")
    private String interpretation;
    
    @Column(columnDefinition = "TEXT")
    private String comments;
    
    @Column(nullable = false)
    private String performedBy;
    
    @Column(nullable = false)
    private String performedByName;
    
    private LocalDateTime performedAt;
    
    @Column
    private String validatedBy;
    
    @Column
    private String validatedByName;
    
    private LocalDateTime validatedAt;
    
    @Column(columnDefinition = "TEXT")
    private String validationNotes;
    
    @OneToMany(mappedBy = "diagnosticResult", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ResultAttachment> attachments = new ArrayList<>();
    
    // Constructors
    public DiagnosticResult() {}
    
    public DiagnosticResult(DiagnosticOrder diagnosticOrder, DiagnosticItem diagnosticItem, 
                           String performedBy, String performedByName) {
        this.diagnosticOrder = diagnosticOrder;
        this.diagnosticItem = diagnosticItem;
        this.performedBy = performedBy;
        this.performedByName = performedByName;
    }
    
    // Getters and Setters
    public DiagnosticOrder getDiagnosticOrder() { return diagnosticOrder; }
    public void setDiagnosticOrder(DiagnosticOrder diagnosticOrder) { this.diagnosticOrder = diagnosticOrder; }
    
    public DiagnosticItem getDiagnosticItem() { return diagnosticItem; }
    public void setDiagnosticItem(DiagnosticItem diagnosticItem) { this.diagnosticItem = diagnosticItem; }
    
    public Sample getSample() { return sample; }
    public void setSample(Sample sample) { this.sample = sample; }
    
    public ResultTemplate getResultTemplate() { return resultTemplate; }
    public void setResultTemplate(ResultTemplate resultTemplate) { this.resultTemplate = resultTemplate; }
    
    public ResultStatus getStatus() { return status; }
    public void setStatus(ResultStatus status) { this.status = status; }
    
    public String getFieldName() { return fieldName; }
    public void setFieldName(String fieldName) { this.fieldName = fieldName; }
    
    public String getFieldLabel() { return fieldLabel; }
    public void setFieldLabel(String fieldLabel) { this.fieldLabel = fieldLabel; }
    
    public Long getTestCatalogId() { return testCatalogId; }
    public void setTestCatalogId(Long testCatalogId) { this.testCatalogId = testCatalogId; }
    
    public String getResultValue() { return resultValue; }
    public void setResultValue(String resultValue) { this.resultValue = resultValue; }
    
    public String getResultText() { return resultText; }
    public void setResultText(String resultText) { this.resultText = resultText; }
    
    public String getInterpretation() { return interpretation; }
    public void setInterpretation(String interpretation) { this.interpretation = interpretation; }
    
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    
    public String getPerformedByName() { return performedByName; }
    public void setPerformedByName(String performedByName) { this.performedByName = performedByName; }
    
    public LocalDateTime getPerformedAt() { return performedAt; }
    public void setPerformedAt(LocalDateTime performedAt) { this.performedAt = performedAt; }
    
    public String getValidatedBy() { return validatedBy; }
    public void setValidatedBy(String validatedBy) { this.validatedBy = validatedBy; }
    
    public String getValidatedByName() { return validatedByName; }
    public void setValidatedByName(String validatedByName) { this.validatedByName = validatedByName; }
    
    public LocalDateTime getValidatedAt() { return validatedAt; }
    public void setValidatedAt(LocalDateTime validatedAt) { this.validatedAt = validatedAt; }
    
    public String getValidationNotes() { return validationNotes; }
    public void setValidationNotes(String validationNotes) { this.validationNotes = validationNotes; }
    
    public List<ResultAttachment> getAttachments() { return attachments; }
    public void setAttachments(List<ResultAttachment> attachments) { this.attachments = attachments; }
}
