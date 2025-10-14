package com.afyaquik.hms.diagnostics.domain;

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
@Table(name = "result_templates")
public class ResultTemplate extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_catalog_id", nullable = false)
    private TestCatalog testCatalog;
    
    @Column(nullable = false)
    private String fieldName;
    
    @Column(nullable = false)
    private String fieldLabel;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FieldType fieldType;
    
    @Column(columnDefinition = "TEXT")
    private String fieldOptions; // JSON string for dropdown options
    
    @Column(nullable = false)
    private boolean required = false;
    
    @Column(nullable = false)
    private Integer sortOrder = 0;
    
    @Column(columnDefinition = "TEXT")
    private String validationRules; // JSON string for validation rules
    
    @Column(columnDefinition = "TEXT")
    private String normalRange;
    
    @Column(columnDefinition = "TEXT")
    private String units;
    
    @Column(nullable = false)
    private boolean active = true;
    
    @OneToMany(mappedBy = "resultTemplate", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DiagnosticResult> diagnosticResults = new ArrayList<>();
    
    // Constructors
    public ResultTemplate() {}
    
    public ResultTemplate(TestCatalog testCatalog, String fieldName, String fieldLabel, FieldType fieldType) {
        this.testCatalog = testCatalog;
        this.fieldName = fieldName;
        this.fieldLabel = fieldLabel;
        this.fieldType = fieldType;
    }
    
    // Getters and Setters
    public TestCatalog getTestCatalog() { return testCatalog; }
    public void setTestCatalog(TestCatalog testCatalog) { this.testCatalog = testCatalog; }
    
    public String getFieldName() { return fieldName; }
    public void setFieldName(String fieldName) { this.fieldName = fieldName; }
    
    public String getFieldLabel() { return fieldLabel; }
    public void setFieldLabel(String fieldLabel) { this.fieldLabel = fieldLabel; }
    
    public FieldType getFieldType() { return fieldType; }
    public void setFieldType(FieldType fieldType) { this.fieldType = fieldType; }
    
    public String getFieldOptions() { return fieldOptions; }
    public void setFieldOptions(String fieldOptions) { this.fieldOptions = fieldOptions; }
    
    public boolean isRequired() { return required; }
    public void setRequired(boolean required) { this.required = required; }
    
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    
    public String getValidationRules() { return validationRules; }
    public void setValidationRules(String validationRules) { this.validationRules = validationRules; }
    
    public String getNormalRange() { return normalRange; }
    public void setNormalRange(String normalRange) { this.normalRange = normalRange; }
    
    public String getUnits() { return units; }
    public void setUnits(String units) { this.units = units; }
    
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    
    public List<DiagnosticResult> getDiagnosticResults() { return diagnosticResults; }
    public void setDiagnosticResults(List<DiagnosticResult> diagnosticResults) { this.diagnosticResults = diagnosticResults; }
}
