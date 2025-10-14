package com.afyaquik.hms.diagnostics.dto;

import java.math.BigDecimal;

import com.afyaquik.hms.diagnostics.domain.TestType;

public class TestCatalogDto {
    private Long id;
    private String testCode;
    private String testName;
    private String description;
    private Long testCategoryId;
    private String categoryName;
    private TestType testType;
    private BigDecimal cost;
    private String department;
    private String departmentName;
    private boolean active;
    private String instructions;
    private String preparationInstructions;
    private Integer estimatedDurationMinutes;
    
    // Constructors
    public TestCatalogDto() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTestCode() { return testCode; }
    public void setTestCode(String testCode) { this.testCode = testCode; }
    
    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Long getTestCategoryId() { return testCategoryId; }
    public void setTestCategoryId(Long testCategoryId) { this.testCategoryId = testCategoryId; }
    
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    
    public TestType getTestType() { return testType; }
    public void setTestType(TestType testType) { this.testType = testType; }
    
    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { this.cost = cost; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    
    public String getPreparationInstructions() { return preparationInstructions; }
    public void setPreparationInstructions(String preparationInstructions) { this.preparationInstructions = preparationInstructions; }
    
    public Integer getEstimatedDurationMinutes() { return estimatedDurationMinutes; }
    public void setEstimatedDurationMinutes(Integer estimatedDurationMinutes) { this.estimatedDurationMinutes = estimatedDurationMinutes; }
}
