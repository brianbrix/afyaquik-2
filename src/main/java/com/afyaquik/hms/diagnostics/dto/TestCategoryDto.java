package com.afyaquik.hms.diagnostics.dto;

import com.afyaquik.hms.diagnostics.domain.TestType;

public class TestCategoryDto {
    private Long id;
    private String categoryCode;
    private String categoryName;
    private String description;
    private TestType testType;
    private boolean active;
    private Integer sortOrder;
    
    // Constructors
    public TestCategoryDto() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCategoryCode() { return categoryCode; }
    public void setCategoryCode(String categoryCode) { this.categoryCode = categoryCode; }
    
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public TestType getTestType() { return testType; }
    public void setTestType(TestType testType) { this.testType = testType; }
    
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
