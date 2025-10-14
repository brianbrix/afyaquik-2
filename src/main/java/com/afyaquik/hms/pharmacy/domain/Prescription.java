package com.afyaquik.hms.pharmacy.domain;

import java.time.LocalDateTime;

import com.afyaquik.hms.auth.domain.StaffUser;
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

@Entity
@Table(name = "prescriptions", 
       indexes = {
           @Index(name = "idx_prescriptions_tenant_patient", columnList = "tenant_id,patient_id"),
           @Index(name = "idx_prescriptions_tenant_doctor", columnList = "tenant_id,prescribed_by"),
           @Index(name = "idx_prescriptions_status", columnList = "tenant_id,status"),
           @Index(name = "idx_prescriptions_prescription_number", columnList = "tenant_id,prescription_number", unique = true)
       })
public class Prescription extends BaseEntity {

    @Column(name = "prescription_number", nullable = false, length = 64)
    private String prescriptionNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prescribed_by", nullable = false)
    private StaffUser prescribedBy;

    @Column(name = "prescription_date", nullable = false)
    private LocalDateTime prescriptionDate;

    @Column(name = "status", nullable = false, length = 32)
    @Enumerated(EnumType.STRING)
    private PrescriptionStatus status = PrescriptionStatus.PENDING;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @Column(name = "total_amount", precision = 10, scale = 2)
    private java.math.BigDecimal totalAmount;

    @Column(name = "dispensed_by")
    private Long dispensedBy;

    @Column(name = "dispensed_at")
    private LocalDateTime dispensedAt;

    @Column(name = "dispensing_notes", columnDefinition = "text")
    private String dispensingNotes;

    // Getters and Setters
    public String getPrescriptionNumber() {
        return prescriptionNumber;
    }

    public void setPrescriptionNumber(String prescriptionNumber) {
        this.prescriptionNumber = prescriptionNumber;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public StaffUser getPrescribedBy() {
        return prescribedBy;
    }

    public void setPrescribedBy(StaffUser prescribedBy) {
        this.prescribedBy = prescribedBy;
    }

    public LocalDateTime getPrescriptionDate() {
        return prescriptionDate;
    }

    public void setPrescriptionDate(LocalDateTime prescriptionDate) {
        this.prescriptionDate = prescriptionDate;
    }

    public PrescriptionStatus getStatus() {
        return status;
    }

    public void setStatus(PrescriptionStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public java.math.BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(java.math.BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Long getDispensedBy() {
        return dispensedBy;
    }

    public void setDispensedBy(Long dispensedBy) {
        this.dispensedBy = dispensedBy;
    }

    public LocalDateTime getDispensedAt() {
        return dispensedAt;
    }

    public void setDispensedAt(LocalDateTime dispensedAt) {
        this.dispensedAt = dispensedAt;
    }

    public String getDispensingNotes() {
        return dispensingNotes;
    }

    public void setDispensingNotes(String dispensingNotes) {
        this.dispensingNotes = dispensingNotes;
    }

    public enum PrescriptionStatus {
        PENDING,
        DISPENSED,
        CANCELLED,
        EXPIRED
    }
}

