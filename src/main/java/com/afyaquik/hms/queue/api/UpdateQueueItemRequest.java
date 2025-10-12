package com.afyaquik.hms.queue.api;

import com.afyaquik.hms.queue.domain.QueuePriority;

public class UpdateQueueItemRequest {
    private String visitReason;
    private QueuePriority priority;
    private String departmentId;

    public String getVisitReason() {
        return visitReason;
    }
    public void setVisitReason(String visitReason) {
        this.visitReason = visitReason;
    }
    public QueuePriority getPriority() {
        return priority;
    }
    public void setPriority(QueuePriority priority) {
        this.priority = priority;
    }
    public String getDepartmentId() {
        return departmentId;
    }
    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }
}