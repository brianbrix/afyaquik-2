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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "test_categories")
public class TestCategory extends BaseEntity {
    
    @Column(nullable = false, unique = true)
    private String categoryCode;
    
    @Column(nullable = false)
    private String categoryName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TestType testType;
    
    @Column(nullable = false)
    private boolean active = true;
    
    @Column(nullable = false)
    private Integer sortOrder = 0;
    
    @OneToMany(mappedBy = "testCategory", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TestCatalog> testCatalogs = new ArrayList<>();
    
    // Constructors
    public TestCategory() {}
    
    public TestCategory(String categoryCode, String categoryName, TestType testType) {
        this.categoryCode = categoryCode;
        this.categoryName = categoryName;
        this.testType = testType;
    }
    
    // Getters and Setters
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
    
    public List<TestCatalog> getTestCatalogs() { return testCatalogs; }
    public void setTestCatalogs(List<TestCatalog> testCatalogs) { this.testCatalogs = testCatalogs; }
}
