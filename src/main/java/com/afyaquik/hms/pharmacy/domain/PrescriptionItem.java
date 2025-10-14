package com.afyaquik.hms.pharmacy.domain;

import java.math.BigDecimal;

import com.afyaquik.hms.common.domain.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "prescription_items", 
       indexes = {
           @Index(name = "idx_prescription_items_prescription", columnList = "prescription_id"),
           @Index(name = "idx_prescription_items_medication", columnList = "medication_id")
       })
public class PrescriptionItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;

    @Column(name = "quantity_prescribed", nullable = false)
    private Integer quantityPrescribed;

    @Column(name = "quantity_dispensed")
    private Integer quantityDispensed = 0;

    @Column(name = "dosage_instructions", columnDefinition = "text")
    private String dosageInstructions;

    @Column(name = "frequency", length = 64)
    private String frequency; // daily, twice daily, etc.

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    // Getters and Setters
    public Prescription getPrescription() {
        return prescription;
    }

    public void setPrescription(Prescription prescription) {
        this.prescription = prescription;
    }

    public Medication getMedication() {
        return medication;
    }

    public void setMedication(Medication medication) {
        this.medication = medication;
    }

    public Integer getQuantityPrescribed() {
        return quantityPrescribed;
    }

    public void setQuantityPrescribed(Integer quantityPrescribed) {
        this.quantityPrescribed = quantityPrescribed;
    }

    public Integer getQuantityDispensed() {
        return quantityDispensed;
    }

    public void setQuantityDispensed(Integer quantityDispensed) {
        this.quantityDispensed = quantityDispensed;
    }

    public String getDosageInstructions() {
        return dosageInstructions;
    }

    public void setDosageInstructions(String dosageInstructions) {
        this.dosageInstructions = dosageInstructions;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Helper methods
    public boolean isFullyDispensed() {
        return quantityDispensed != null && quantityDispensed >= quantityPrescribed;
    }

    public Integer getRemainingQuantity() {
        if (quantityDispensed == null) {
            return quantityPrescribed;
        }
        return Math.max(0, quantityPrescribed - quantityDispensed);
    }
}

