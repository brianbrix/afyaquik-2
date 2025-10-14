package com.afyaquik.hms.diagnostics.dto;

import com.afyaquik.hms.diagnostics.domain.FieldType;

public class ResultTemplateDto {
    private Long id;
    private Long testCatalogId;
    private String testName;
    private String fieldName;
    private String fieldLabel;
    private FieldType fieldType;
    private String fieldOptions;
    private boolean required;
    private Integer sortOrder;
    private String validationRules;
    private String normalRange;
    private String units;
    private boolean active;
    
    // Constructors
    public ResultTemplateDto() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getTestCatalogId() { return testCatalogId; }
    public void setTestCatalogId(Long testCatalogId) { this.testCatalogId = testCatalogId; }
    
    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }
    
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
}
