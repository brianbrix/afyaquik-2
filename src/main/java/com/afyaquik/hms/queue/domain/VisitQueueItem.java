package com.afyaquik.hms.queue.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import com.afyaquik.hms.patient.domain.Patient;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;


import com.afyaquik.hms.patient.model.PatientInsuranceDetails;
import java.util.Set;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinTable;
import jakarta.persistence.Lob;

@Entity
@Table(name = "visit_queue_items",
       indexes = {
           @Index(name = "idx_queue_tenant_status", columnList = "tenant_id,current_status"),
           @Index(name = "idx_queue_ticket", columnList = "tenant_id,ticket_number", unique = true),
           @Index(name = "idx_queue_assignee", columnList = "tenant_id,current_assignee_id")
       })
public class VisitQueueItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "ticket_number", nullable = false, length = 16)
    private String ticketNumber;

    @Column(name = "visit_reason", length = 255)
    private String visitReason;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false, length = 32)
    private QueueStatus currentStatus = QueueStatus.PENDING_CHECKIN;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 32)
    private QueueStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 16)
    private QueuePriority priority = QueuePriority.MEDIUM;

    @Column(name = "current_assignee_id", length = 64)
    private String currentAssigneeId;

    @Column(name = "department_id", length = 64)
    private String departmentId;

    @Column(name = "sla_due_at")

    private Instant slaDueAt;

    @Lob
    @Column(name = "additional_details")
    private String additionalDetails;

    public String getAdditionalDetails() {
        return additionalDetails;
    }

    public void setAdditionalDetails(String additionalDetails) {
        this.additionalDetails = additionalDetails;
    }

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "queue_item_insurance_details",
        joinColumns = @JoinColumn(name = "queue_item_id"),
        inverseJoinColumns = @JoinColumn(name = "insurance_details_id")
    )
    private Set<PatientInsuranceDetails> insuranceDetails;

    public Set<PatientInsuranceDetails> getInsuranceDetails() {
        return insuranceDetails;
    }

    public void setInsuranceDetails(Set<PatientInsuranceDetails> insuranceDetails) {
        this.insuranceDetails = insuranceDetails;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public String getTicketNumber() {
        return ticketNumber;
    }

    public void setTicketNumber(String ticketNumber) {
        this.ticketNumber = ticketNumber;
    }

    public String getVisitReason() {
        return visitReason;
    }

    public void setVisitReason(String visitReason) {
        this.visitReason = visitReason;
    }

    public QueueStatus getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(QueueStatus currentStatus) {
        this.currentStatus = currentStatus;
    }

    public QueuePriority getPriority() {
        return priority;
    }

    public void setPriority(QueuePriority priority) {
        this.priority = priority;
    }

    public QueueStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(QueueStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public String getCurrentAssigneeId() {
        return currentAssigneeId;
    }

    public void setCurrentAssigneeId(String currentAssigneeId) {
        this.currentAssigneeId = currentAssigneeId;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public Instant getSlaDueAt() {
        return slaDueAt;
    }

    public void setSlaDueAt(Instant slaDueAt) {
        this.slaDueAt = slaDueAt;
    }
}
