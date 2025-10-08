package com.afyaquik.hms.queue.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
@Entity
@Table(name = "queue_timeline_entries",
       indexes = {
           @Index(name = "idx_timeline_tenant_queue", columnList = "tenant_id,queue_item_id,created_at"),
           @Index(name = "idx_timeline_queue", columnList = "queue_item_id")
       })
public class QueueTimelineEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "queue_item_id", nullable = false)
    private VisitQueueItem queueItem;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 32)
    private QueueEventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 32)
    private QueueStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", length = 32)
    private QueueStatus toStatus;

    @Column(name = "actor_id", length = 64)
    private String actorId;

    @Column(name = "actor_role", length = 64)
    private String actorRole;

    @Column(name = "actor_display_name", length = 128)
    private String actorDisplayName;

    @Column(name = "note", length = 512)
    private String note;

    @Column(name = "department_id", length = 64)
    private String departmentId;

    public VisitQueueItem getQueueItem() {
        return queueItem;
    }

    public void setQueueItem(VisitQueueItem queueItem) {
        this.queueItem = queueItem;
    }

    public QueueEventType getEventType() {
        return eventType;
    }

    public void setEventType(QueueEventType eventType) {
        this.eventType = eventType;
    }

    public QueueStatus getFromStatus() {
        return fromStatus;
    }

    public void setFromStatus(QueueStatus fromStatus) {
        this.fromStatus = fromStatus;
    }

    public QueueStatus getToStatus() {
        return toStatus;
    }

    public void setToStatus(QueueStatus toStatus) {
        this.toStatus = toStatus;
    }

    public String getActorId() {
        return actorId;
    }

    public void setActorId(String actorId) {
        this.actorId = actorId;
    }

    public String getActorRole() {
        return actorRole;
    }

    public void setActorRole(String actorRole) {
        this.actorRole = actorRole;
    }

    public String getActorDisplayName() {
        return actorDisplayName;
    }

    public void setActorDisplayName(String actorDisplayName) {
        this.actorDisplayName = actorDisplayName;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

}
