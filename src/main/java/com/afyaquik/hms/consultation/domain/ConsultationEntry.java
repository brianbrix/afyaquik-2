package com.afyaquik.hms.consultation.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import com.afyaquik.hms.queue.domain.VisitQueueItem;
import jakarta.persistence.*;

@Entity
@Table(name = "consultation_entries")
public class ConsultationEntry extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "queue_item_id", nullable = false)
    private VisitQueueItem queueItem;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "details", columnDefinition = "text", nullable = false, length = 4000)
    private String details;

    @Column(name = "created_by", length = 64)
    private String createdBy;

    public VisitQueueItem getQueueItem() { return queueItem; }
    public void setQueueItem(VisitQueueItem queueItem) { this.queueItem = queueItem; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
