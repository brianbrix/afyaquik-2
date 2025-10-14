package com.afyaquik.hms.pharmacy.dto;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PrescriptionRequest {
    
    @NotBlank(message = "Prescription number is required")
    @Size(max = 64, message = "Prescription number must not exceed 64 characters")
    private String prescriptionNumber;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Prescribed by ID is required")
    private Long prescribedById;

    @NotNull(message = "Prescription date is required")
    private LocalDateTime prescriptionDate;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @Valid
    @NotNull(message = "Prescription items are required")
    private List<PrescriptionItemRequest> items;

    // Constructors
    public PrescriptionRequest() {}

    // Getters and Setters
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

    public Long getPrescribedById() {
        return prescribedById;
    }

    public void setPrescribedById(Long prescribedById) {
        this.prescribedById = prescribedById;
    }

    public LocalDateTime getPrescriptionDate() {
        return prescriptionDate;
    }

    public void setPrescriptionDate(LocalDateTime prescriptionDate) {
        this.prescriptionDate = prescriptionDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<PrescriptionItemRequest> getItems() {
        return items;
    }

    public void setItems(List<PrescriptionItemRequest> items) {
        this.items = items;
    }
}

