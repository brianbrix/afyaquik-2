package com.afyaquik.hms.pharmacy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PharmacyActionRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Details are required")
    private String details;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    @NotNull
    private Boolean isCustom = false;
    
    private Integer sortOrder = 0;
    
    private Long queueItemId;
    
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
    
    public Long getQueueItemId() { return queueItemId; }
    public void setQueueItemId(Long queueItemId) { this.queueItemId = queueItemId; }
}


