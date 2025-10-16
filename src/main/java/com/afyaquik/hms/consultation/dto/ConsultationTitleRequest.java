package com.afyaquik.hms.consultation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

/**
 * Request DTO for ConsultationTitle operations.
 */
public class ConsultationTitleRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Level is required")
    @Min(value = 1, message = "Level must be at least 1")
    @Max(value = 3, message = "Level cannot exceed 3")
    private Integer level;

    private Integer sortOrder = 0;

    private Boolean isCustom = false;

    private Long parentId;

    // Constructors
    public ConsultationTitleRequest() {}

    public ConsultationTitleRequest(String title, Integer level, Long parentId) {
        this.title = title;
        this.level = level;
        this.parentId = parentId;
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Boolean getIsCustom() {
        return isCustom;
    }

    public void setIsCustom(Boolean isCustom) {
        this.isCustom = isCustom;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }
}

