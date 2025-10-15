package com.afyaquik.hms.inventory.dto;

import jakarta.validation.constraints.NotBlank;

public class ItemCategoryRequest {
    
    @NotBlank
    private String categoryName;
    
    private String description;
    
    private Boolean isActive = true;
    
    // Constructors
    public ItemCategoryRequest() {}
    
    // Getters and Setters
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}

