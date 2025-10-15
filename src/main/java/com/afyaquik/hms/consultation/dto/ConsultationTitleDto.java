package com.afyaquik.hms.consultation.dto;

import java.time.Instant;
import java.util.List;

public class ConsultationTitleDto {
    private Long id;
    private String title;
    private Integer level;
    private Integer sortOrder;
    private Boolean isCustom;
    private Long parentId;
    private String parentTitle;
    private List<ConsultationTitleDto> children;
    private Instant createdAt;
    private Instant updatedAt;

    public ConsultationTitleDto() {}
    
    public ConsultationTitleDto(Long id, String title) {
        this.id = id;
        this.title = title;
    }
    
    public ConsultationTitleDto(Long id, String title, Integer level, Long parentId, String parentTitle, Boolean isCustom) {
        this.id = id;
        this.title = title;
        this.level = level;
        this.parentId = parentId;
        this.parentTitle = parentTitle;
        this.isCustom = isCustom;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }
    
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    
    public Boolean getIsCustom() { return isCustom; }
    public void setIsCustom(Boolean isCustom) { this.isCustom = isCustom; }
    
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    
    public String getParentTitle() { return parentTitle; }
    public void setParentTitle(String parentTitle) { this.parentTitle = parentTitle; }
    
    public List<ConsultationTitleDto> getChildren() { return children; }
    public void setChildren(List<ConsultationTitleDto> children) { this.children = children; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
