package com.afyaquik.hms.billing.dto;

import java.time.Instant;
import java.time.OffsetDateTime;

public class BillingItemCategoryDto {
    private Long id;
    private String categoryName;
    private String description;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    // Constructors
    public BillingItemCategoryDto() {}

    public BillingItemCategoryDto(Long id, String categoryName, String description, Boolean isActive) {
        this.id = id;
        this.categoryName = categoryName;
        this.description = description;
        this.isActive = isActive;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
