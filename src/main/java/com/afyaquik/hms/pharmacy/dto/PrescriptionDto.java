package com.afyaquik.hms.pharmacy.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Instant;
import java.util.List;

import com.afyaquik.hms.pharmacy.domain.Prescription;

public class PrescriptionDto {
    private Long id;
    private String prescriptionNumber;
    private Long patientId;
    private String patientName;
    private String patientMrn;
    private Long prescribedById;
    private String prescribedByName;
    private LocalDateTime prescriptionDate;
    private Prescription.PrescriptionStatus status;
    private String notes;
    private BigDecimal totalAmount;
    private Long dispensedBy;
    private String dispensedByName;
    private LocalDateTime dispensedAt;
    private String dispensingNotes;
    private List<PrescriptionItemDto> items;
    private Instant createdAt;
    private Instant updatedAt;

    // Constructors
    public PrescriptionDto() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPrescriptionNumber() {
        return prescriptionNumber;
    }

    public void setPrescriptionNumber(String prescriptionNumber) {
        this.prescriptionNumber = prescriptionNumber;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getPatientMrn() {
        return patientMrn;
    }

    public void setPatientMrn(String patientMrn) {
        this.patientMrn = patientMrn;
    }

    public Long getPrescribedById() {
        return prescribedById;
    }

    public void setPrescribedById(Long prescribedById) {
        this.prescribedById = prescribedById;
    }

    public String getPrescribedByName() {
        return prescribedByName;
    }

    public void setPrescribedByName(String prescribedByName) {
        this.prescribedByName = prescribedByName;
    }

    public LocalDateTime getPrescriptionDate() {
        return prescriptionDate;
    }

    public void setPrescriptionDate(LocalDateTime prescriptionDate) {
        this.prescriptionDate = prescriptionDate;
    }

    public Prescription.PrescriptionStatus getStatus() {
        return status;
    }

    public void setStatus(Prescription.PrescriptionStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Long getDispensedBy() {
        return dispensedBy;
    }

    public void setDispensedBy(Long dispensedBy) {
        this.dispensedBy = dispensedBy;
    }

    public String getDispensedByName() {
        return dispensedByName;
    }

    public void setDispensedByName(String dispensedByName) {
        this.dispensedByName = dispensedByName;
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

    public List<PrescriptionItemDto> getItems() {
        return items;
    }

    public void setItems(List<PrescriptionItemDto> items) {
        this.items = items;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

