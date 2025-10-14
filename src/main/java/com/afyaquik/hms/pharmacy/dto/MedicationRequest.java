package com.afyaquik.hms.pharmacy.dto;

import java.math.BigDecimal;

import com.afyaquik.hms.pharmacy.domain.DosageForm;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class MedicationRequest {
    
    @NotBlank(message = "Medication code is required")
    @Size(max = 64, message = "Medication code must not exceed 64 characters")
    private String medicationCode;

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @Size(max = 255, message = "Generic name must not exceed 255 characters")
    private String genericName;

    @Size(max = 128, message = "Manufacturer must not exceed 128 characters")
    private String manufacturer;

    private DosageForm dosageForm;

    @Size(max = 64, message = "Strength must not exceed 64 characters")
    private String strength;

    @Size(max = 32, message = "Unit of measure must not exceed 32 characters")
    private String unitOfMeasure;

    private String description;

    @PositiveOrZero(message = "Unit price must be positive or zero")
    private BigDecimal unitPrice;

    @NotNull(message = "Controlled substance flag is required")
    private Boolean controlledSubstance = false;

    @NotNull(message = "Requires prescription flag is required")
    private Boolean requiresPrescription = true;

    @NotNull(message = "Active flag is required")
    private Boolean active = true;

    // Constructors
    public MedicationRequest() {}

    // Getters and Setters
    public String getMedicationCode() {
        return medicationCode;
    }

    public void setMedicationCode(String medicationCode) {
        this.medicationCode = medicationCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getGenericName() {
        return genericName;
    }

    public void setGenericName(String genericName) {
        this.genericName = genericName;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public DosageForm getDosageForm() {
        return dosageForm;
    }

    public void setDosageForm(DosageForm dosageForm) {
        this.dosageForm = dosageForm;
    }

    public String getStrength() {
        return strength;
    }

    public void setStrength(String strength) {
        this.strength = strength;
    }

    public String getUnitOfMeasure() {
        return unitOfMeasure;
    }

    public void setUnitOfMeasure(String unitOfMeasure) {
        this.unitOfMeasure = unitOfMeasure;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Boolean getControlledSubstance() {
        return controlledSubstance;
    }

    public void setControlledSubstance(Boolean controlledSubstance) {
        this.controlledSubstance = controlledSubstance;
    }

    public Boolean getRequiresPrescription() {
        return requiresPrescription;
    }

    public void setRequiresPrescription(Boolean requiresPrescription) {
        this.requiresPrescription = requiresPrescription;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
