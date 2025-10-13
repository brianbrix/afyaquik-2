package com.afyaquik.hms.queue.api;

import com.afyaquik.hms.queue.domain.QueuePriority;

public class UpdateQueueItemRequest {
    private String visitReason;
    private QueuePriority priority;
    private String departmentId;


    // IDs of PatientInsuranceDetails to associate with this queue item
    private java.util.Set<Long> insuranceDetailsIds;

    // WYSIWYG additional details
    private String additionalDetails;

    public String getAdditionalDetails() {
        return additionalDetails;
    }

    public void setAdditionalDetails(String additionalDetails) {
        this.additionalDetails = additionalDetails;
    }

    public java.util.Set<Long> getInsuranceDetailsIds() {
        return insuranceDetailsIds;
    }

    public void setInsuranceDetailsIds(java.util.Set<Long> insuranceDetailsIds) {
        this.insuranceDetailsIds = insuranceDetailsIds;
    }

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