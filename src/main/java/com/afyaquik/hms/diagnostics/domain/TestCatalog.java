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
@Table(name = "test_catalog")
public class TestCatalog extends BaseEntity {
    
    @Column(nullable = false, unique = true)
    private String testCode;
    
    @Column(nullable = false)
    private String testName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_category_id", nullable = false)
    private TestCategory testCategory;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TestType testType;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal cost;
    
    @Column(nullable = false)
    private String department;
    
    @Column(nullable = false)
    private String departmentName;
    
    @Column(nullable = false)
    private boolean active = true;
    
    @Column(columnDefinition = "TEXT")
    private String instructions;
    
    @Column(columnDefinition = "TEXT")
    private String preparationInstructions;
    
    @Column(nullable = false)
    private Integer estimatedDurationMinutes;
    
    @OneToMany(mappedBy = "testCatalog", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ResultTemplate> resultTemplates = new ArrayList<>();
    
    // Constructors
    public TestCatalog() {}
    
    public TestCatalog(String testCode, String testName, TestCategory testCategory, TestType testType, 
                      String department, String departmentName, Integer estimatedDurationMinutes) {
        this.testCode = testCode;
        this.testName = testName;
        this.testCategory = testCategory;
        this.testType = testType;
        this.department = department;
        this.departmentName = departmentName;
        this.estimatedDurationMinutes = estimatedDurationMinutes;
    }
    
    // Getters and Setters
    public String getTestCode() { return testCode; }
    public void setTestCode(String testCode) { this.testCode = testCode; }
    
    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public TestCategory getTestCategory() { return testCategory; }
    public void setTestCategory(TestCategory testCategory) { this.testCategory = testCategory; }
    
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
    
    public List<ResultTemplate> getResultTemplates() { return resultTemplates; }
    public void setResultTemplates(List<ResultTemplate> resultTemplates) { this.resultTemplates = resultTemplates; }
}
