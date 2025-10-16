package com.afyaquik.hms.pharmacy.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import com.afyaquik.hms.queue.domain.VisitQueueItem;
import jakarta.persistence.*;

@Entity
@Table(name = "pharmacy_actions")
public class PharmacyAction extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "queue_item_id", nullable = false)
    private VisitQueueItem queueItem;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "details", columnDefinition = "text", nullable = false, length = 4000)
    private String details;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "is_custom", nullable = false)
    private Boolean isCustom = false;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_by", length = 64)
    private String createdBy;

    public VisitQueueItem getQueueItem() { return queueItem; }
    public void setQueueItem(VisitQueueItem queueItem) { this.queueItem = queueItem; }

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
}

