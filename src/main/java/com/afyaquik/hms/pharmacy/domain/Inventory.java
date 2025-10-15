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
@Table(name = "inventory", 
       indexes = {
           @Index(name = "idx_inventory_tenant_medication", columnList = "tenant_id,medication_id", unique = true),
           @Index(name = "idx_inventory_low_stock", columnList = "tenant_id,quantity_in_stock")
       })
public class Inventory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;

    @Column(name = "quantity_in_stock", nullable = false)
    private Integer quantityInStock = 0;

    @Column(name = "minimum_stock_level", nullable = false)
    private Integer minimumStockLevel = 0;

    @Column(name = "maximum_stock_level")
    private Integer maximumStockLevel;

    @Column(name = "reorder_point")
    private Integer reorderPoint;

    @Column(name = "reorder_quantity")
    private Integer reorderQuantity;

    @Column(name = "unit_cost", precision = 10, scale = 2)
    private BigDecimal unitCost;

    @Column(name = "expiry_date")
    private java.time.LocalDate expiryDate;

    @Column(name = "batch_number", length = 64)
    private String batchNumber;

    @Column(name = "supplier", length = 128)
    private String supplier;

    @Column(name = "location", length = 128)
    private String location; // shelf, room, etc.

    @Column(name = "notes", columnDefinition = "text")
    private String notes;

    @Column(name = "used_in_prescriptions", nullable = false)
    private Boolean usedInPrescriptions = false;

    private boolean active;

    // Getters and Setters
    public Medication getMedication() {
        return medication;
    }

    public void setMedication(Medication medication) {
        this.medication = medication;
    }

    public Integer getQuantityInStock() {
        return quantityInStock;
    }

    public void setQuantityInStock(Integer quantityInStock) {
        this.quantityInStock = quantityInStock;
    }

    public Integer getMinimumStockLevel() {
        return minimumStockLevel;
    }

    public void setMinimumStockLevel(Integer minimumStockLevel) {
        this.minimumStockLevel = minimumStockLevel;
    }

    public Integer getMaximumStockLevel() {
        return maximumStockLevel;
    }

    public void setMaximumStockLevel(Integer maximumStockLevel) {
        this.maximumStockLevel = maximumStockLevel;
    }

    public Integer getReorderPoint() {
        return reorderPoint;
    }

    public void setReorderPoint(Integer reorderPoint) {
        this.reorderPoint = reorderPoint;
    }

    public Integer getReorderQuantity() {
        return reorderQuantity;
    }

    public void setReorderQuantity(Integer reorderQuantity) {
        this.reorderQuantity = reorderQuantity;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(BigDecimal unitCost) {
        this.unitCost = unitCost;
    }

    public java.time.LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(java.time.LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Helper methods
    public boolean isLowStock() {
        return quantityInStock <= minimumStockLevel;
    }

    public boolean needsReorder() {
        return reorderPoint != null && quantityInStock <= reorderPoint;
    }

    public boolean isExpired() {
        return expiryDate != null && expiryDate.isBefore(java.time.LocalDate.now());
    }

    public boolean isExpiringSoon(int days) {
        return expiryDate != null && expiryDate.isBefore(java.time.LocalDate.now().plusDays(days));
    }

    public Boolean getUsedInPrescriptions() {
        return usedInPrescriptions;
    }

    public void setUsedInPrescriptions(Boolean usedInPrescriptions) {
        this.usedInPrescriptions = usedInPrescriptions;
    }

    public void setActive(boolean b) {
        this.active = b;
    }

    public boolean isActive() {
        return active;
    }
}

