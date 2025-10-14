package com.afyaquik.hms.pharmacy.domain;

import java.math.BigDecimal;

import com.afyaquik.hms.common.domain.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Entity
@Table(name = "medications", 
       indexes = {
           @Index(name = "idx_medications_tenant_code", columnList = "tenant_id,medication_code", unique = true),
           @Index(name = "idx_medications_tenant_name", columnList = "tenant_id,name")
       })
public class Medication extends BaseEntity {

    @Column(name = "medication_code", nullable = false, length = 64)
    private String medicationCode;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "generic_name", length = 255)
    private String genericName;

    @Column(name = "manufacturer", length = 128)
    private String manufacturer;

    @Enumerated(EnumType.STRING)
    @Column(name = "dosage_form", length = 64)
    private DosageForm dosageForm;

    @Column(name = "strength", length = 64)
    private String strength; // 500mg, 10ml, etc.

    @Column(name = "unit_of_measure", length = 32)
    private String unitOfMeasure; // mg, ml, units, etc.

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "is_controlled_substance", nullable = false)
    private boolean controlledSubstance = false;

    @Column(name = "requires_prescription", nullable = false)
    private boolean requiresPrescription = true;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

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
}
