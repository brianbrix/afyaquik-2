package com.afyaquik.hms.pharmacy.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.Instant;

import com.afyaquik.hms.pharmacy.domain.DosageForm;

public class MedicationDto {
    private Long id;
    private String medicationCode;
    private String name;
    private String genericName;
    private String manufacturer;
    private DosageForm dosageForm;
    private String strength;
    private String unitOfMeasure;
    private String description;
    private BigDecimal unitPrice;
    private boolean controlledSubstance;
    private boolean requiresPrescription;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    // Constructors
    public MedicationDto() {}

    public MedicationDto(Long id, String medicationCode, String name, String genericName,
                         String manufacturer, DosageForm dosageForm, String strength,
                         String unitOfMeasure, String description, BigDecimal unitPrice,
                         boolean controlledSubstance, boolean requiresPrescription,
                         boolean active, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.medicationCode = medicationCode;
        this.name = name;
        this.genericName = genericName;
        this.manufacturer = manufacturer;
        this.dosageForm = dosageForm;
        this.strength = strength;
        this.unitOfMeasure = unitOfMeasure;
        this.description = description;
        this.unitPrice = unitPrice;
        this.controlledSubstance = controlledSubstance;
        this.requiresPrescription = requiresPrescription;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public boolean isControlledSubstance() {
        return controlledSubstance;
    }

    public void setControlledSubstance(boolean controlledSubstance) {
        this.controlledSubstance = controlledSubstance;
    }

    public boolean isRequiresPrescription() {
        return requiresPrescription;
    }

    public void setRequiresPrescription(boolean requiresPrescription) {
        this.requiresPrescription = requiresPrescription;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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
