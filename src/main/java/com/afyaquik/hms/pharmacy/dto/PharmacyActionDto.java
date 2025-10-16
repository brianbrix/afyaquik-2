package com.afyaquik.hms.pharmacy.dto;

import java.time.Instant;

public class PharmacyActionDto {
    private Long id;
    private String title;
    private String details;
    private String category;
    private Boolean isCustom;
    private Integer sortOrder;
    private String createdBy;
    private Instant createdAt;

    public PharmacyActionDto() {}
    
    public PharmacyActionDto(Long id, String title, String details, String category, Boolean isCustom, Integer sortOrder, String createdBy, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.details = details;
        this.category = category;
        this.isCustom = isCustom;
        this.sortOrder = sortOrder;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public Boolean getIsCustom() { return isCustom; }
    public void setIsCustom(Boolean isCustom) { this.isCustom = isCustom; }
    
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

