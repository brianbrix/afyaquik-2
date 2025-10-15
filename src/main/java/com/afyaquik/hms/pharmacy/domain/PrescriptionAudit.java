package com.afyaquik.hms.pharmacy.domain;

import java.time.LocalDateTime;

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
@Table(name = "prescription_audit", 
       indexes = {
           @Index(name = "idx_prescription_audit_prescription", columnList = "prescription_id"),
           @Index(name = "idx_prescription_audit_tenant", columnList = "tenant_id"),
           @Index(name = "idx_prescription_audit_action", columnList = "action_type")
       })
public class PrescriptionAudit extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @Column(name = "action_type", nullable = false, length = 32)
    @Enumerated(EnumType.STRING)
    private ActionType actionType;

    @Column(name = "previous_status", length = 32)
    @Enumerated(EnumType.STRING)
    private Prescription.PrescriptionStatus previousStatus;

    @Column(name = "new_status", length = 32)
    @Enumerated(EnumType.STRING)
    private Prescription.PrescriptionStatus newStatus;

    @Column(name = "action_by", length = 255)
    private String actionBy;

    @Column(name = "action_at", nullable = false)
    private LocalDateTime actionAt;

    @Column(name = "reason", columnDefinition = "text")
    private String reason;

    @Column(name = "changes_summary", columnDefinition = "text")
    private String changesSummary;

    @Column(name = "prescription_data", columnDefinition = "text")
    private String prescriptionData; // JSON snapshot of prescription at time of action

    // Getters and Setters
    public Prescription getPrescription() {
        return prescription;
    }

    public void setPrescription(Prescription prescription) {
        this.prescription = prescription;
    }

    public ActionType getActionType() {
        return actionType;
    }

    public void setActionType(ActionType actionType) {
        this.actionType = actionType;
    }

    public Prescription.PrescriptionStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(Prescription.PrescriptionStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public Prescription.PrescriptionStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(Prescription.PrescriptionStatus newStatus) {
        this.newStatus = newStatus;
    }

    public String getActionBy() {
        return actionBy;
    }

    public void setActionBy(String actionBy) {
        this.actionBy = actionBy;
    }

    public LocalDateTime getActionAt() {
        return actionAt;
    }

    public void setActionAt(LocalDateTime actionAt) {
        this.actionAt = actionAt;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getChangesSummary() {
        return changesSummary;
    }

    public void setChangesSummary(String changesSummary) {
        this.changesSummary = changesSummary;
    }

    public String getPrescriptionData() {
        return prescriptionData;
    }

    public void setPrescriptionData(String prescriptionData) {
        this.prescriptionData = prescriptionData;
    }

    public enum ActionType {
        CREATED,
        UPDATED,
        DISPENSED,
        PARTIALLY_DISPENSED,
        CANCELLED,
        REVERSED,
        REPLACED,
        EXPIRED,
        STATUS_CHANGED
    }
}
