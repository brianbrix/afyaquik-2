package com.afyaquik.hms.consultation.dto;

import java.time.Instant;

public class ConsultationEntryDto {
    private Long id;
    private String title;
    private String details;
    private String createdBy;
    private Instant createdAt;
    private Long consultationTitleId;
    private String consultationTitleName;
    private Integer consultationTitleLevel;
    private Boolean isCustom;
    private Integer sortOrder;

    public ConsultationEntryDto() {}
    
    public ConsultationEntryDto(Long id, String title, String details, String createdBy, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.details = details;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }
    
    public ConsultationEntryDto(Long id, String title, String details, String createdBy, Instant createdAt, 
                               Long consultationTitleId, String consultationTitleName, Integer consultationTitleLevel, 
                               Boolean isCustom, Integer sortOrder) {
        this.id = id;
        this.title = title;
        this.details = details;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.consultationTitleId = consultationTitleId;
        this.consultationTitleName = consultationTitleName;
        this.consultationTitleLevel = consultationTitleLevel;
        this.isCustom = isCustom;
        this.sortOrder = sortOrder;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Long getConsultationTitleId() { return consultationTitleId; }
    public void setConsultationTitleId(Long consultationTitleId) { this.consultationTitleId = consultationTitleId; }
    
    public String getConsultationTitleName() { return consultationTitleName; }
    public void setConsultationTitleName(String consultationTitleName) { this.consultationTitleName = consultationTitleName; }
    
    public Integer getConsultationTitleLevel() { return consultationTitleLevel; }
    public void setConsultationTitleLevel(Integer consultationTitleLevel) { this.consultationTitleLevel = consultationTitleLevel; }
    
    public Boolean getIsCustom() { return isCustom; }
    public void setIsCustom(Boolean isCustom) { this.isCustom = isCustom; }
    
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
