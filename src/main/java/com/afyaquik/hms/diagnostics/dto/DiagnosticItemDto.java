package com.afyaquik.hms.diagnostics.dto;

import java.math.BigDecimal;

import com.afyaquik.hms.diagnostics.domain.DiagnosticItemStatus;

public class DiagnosticItemDto {
    private Long id;
    private Long diagnosticOrderId;
    private Long testCatalogId;
    private String testCode;
    private String testName;
    private String testDescription;
    private String testType;
    private String department;
    private String departmentName;
    private DiagnosticItemStatus status;
    private String notes;
    private BigDecimal cost;
    private String orderedBy;
    private String orderedByName;
    
    // Constructors
    public DiagnosticItemDto() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getDiagnosticOrderId() { return diagnosticOrderId; }
    public void setDiagnosticOrderId(Long diagnosticOrderId) { this.diagnosticOrderId = diagnosticOrderId; }
    
    public Long getTestCatalogId() { return testCatalogId; }
    public void setTestCatalogId(Long testCatalogId) { this.testCatalogId = testCatalogId; }
    
    public String getTestCode() { return testCode; }
    public void setTestCode(String testCode) { this.testCode = testCode; }
    
    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }
    
    public String getTestDescription() { return testDescription; }
    public void setTestDescription(String testDescription) { this.testDescription = testDescription; }
    
    public String getTestType() { return testType; }
    public void setTestType(String testType) { this.testType = testType; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    
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
}
