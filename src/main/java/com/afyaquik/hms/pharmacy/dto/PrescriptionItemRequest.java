package com.afyaquik.hms.pharmacy.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class PrescriptionItemRequest {
    
    @NotNull(message = "Medication ID is required")
    private Long medicationId;

    @NotNull(message = "Quantity prescribed is required")
    @Positive(message = "Quantity prescribed must be positive")
    private Integer quantityPrescribed;

    @Size(max = 500, message = "Dosage instructions must not exceed 500 characters")
    private String dosageInstructions;

    @Size(max = 64, message = "Frequency must not exceed 64 characters")
    private String frequency;

    @PositiveOrZero(message = "Duration days must be positive or zero")
    private Integer durationDays;

    @PositiveOrZero(message = "Unit price must be positive or zero")
    private BigDecimal unitPrice;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    // Constructors
    public PrescriptionItemRequest() {}

    // Getters and Setters
    public Long getMedicationId() {
        return medicationId;
    }

    public void setMedicationId(Long medicationId) {
        this.medicationId = medicationId;
    }

    public Integer getQuantityPrescribed() {
        return quantityPrescribed;
    }

    public void setQuantityPrescribed(Integer quantityPrescribed) {
        this.quantityPrescribed = quantityPrescribed;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

