package com.afyaquik.hms.diagnostics.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.afyaquik.hms.diagnostics.domain.ResultStatus;

public class DiagnosticResultDto {
    private Long id;
    private Long diagnosticOrderId;
    private Long diagnosticItemId;
    private Long sampleId;
    private Long resultTemplateId;
    private String fieldName;
    private String fieldLabel;
    private Long testCatalogId;
    private ResultStatus status;
    private String resultValue;
    private String resultText;
    private String interpretation;
    private String comments;
    private String performedBy;
    private String performedByName;
    private LocalDateTime performedAt;
    private String validatedBy;
    private String validatedByName;
    private LocalDateTime validatedAt;
    private String validationNotes;
    private List<ResultAttachmentDto> attachments;
    
    // Constructors
    public DiagnosticResultDto() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getDiagnosticOrderId() { return diagnosticOrderId; }
    public void setDiagnosticOrderId(Long diagnosticOrderId) { this.diagnosticOrderId = diagnosticOrderId; }
    
    public Long getDiagnosticItemId() { return diagnosticItemId; }
    public void setDiagnosticItemId(Long diagnosticItemId) { this.diagnosticItemId = diagnosticItemId; }
    
    public Long getSampleId() { return sampleId; }
    public void setSampleId(Long sampleId) { this.sampleId = sampleId; }
    
    public Long getResultTemplateId() { return resultTemplateId; }
    public void setResultTemplateId(Long resultTemplateId) { this.resultTemplateId = resultTemplateId; }
    
    public String getFieldName() { return fieldName; }
    public void setFieldName(String fieldName) { this.fieldName = fieldName; }
    
    public String getFieldLabel() { return fieldLabel; }
    public void setFieldLabel(String fieldLabel) { this.fieldLabel = fieldLabel; }
    
    public Long getTestCatalogId() { return testCatalogId; }
    public void setTestCatalogId(Long testCatalogId) { this.testCatalogId = testCatalogId; }
    
    public ResultStatus getStatus() { return status; }
    public void setStatus(ResultStatus status) { this.status = status; }
    
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
    
    public List<ResultAttachmentDto> getAttachments() { return attachments; }
    public void setAttachments(List<ResultAttachmentDto> attachments) { this.attachments = attachments; }
}
