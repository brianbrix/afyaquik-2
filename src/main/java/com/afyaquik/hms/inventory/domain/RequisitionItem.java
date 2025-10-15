package com.afyaquik.hms.inventory.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import com.afyaquik.hms.common.domain.TenantAwareEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "requisition_items")
public class RequisitionItem extends BaseEntity implements TenantAwareEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisition_id", nullable = false)
    private Requisition requisition;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;
    
    @NotNull
    @Positive
    @Column(name = "quantity_requested", nullable = false)
    private Integer quantityRequested;
    
    @Column(name = "quantity_fulfilled")
    private Integer quantityFulfilled = 0;
    
    @Column(name = "unit_of_measure")
    private String unitOfMeasure;
    
    @Column(name = "notes")
    private String notes;
    
    // Constructors
    public RequisitionItem() {}
    
    public RequisitionItem(Requisition requisition, InventoryItem inventoryItem, 
                         Integer quantityRequested) {
        this.requisition = requisition;
        this.inventoryItem = inventoryItem;
        this.quantityRequested = quantityRequested;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Requisition getRequisition() { return requisition; }
    public void setRequisition(Requisition requisition) { this.requisition = requisition; }
    
    public InventoryItem getInventoryItem() { return inventoryItem; }
    public void setInventoryItem(InventoryItem inventoryItem) { this.inventoryItem = inventoryItem; }
    
    public Integer getQuantityRequested() { return quantityRequested; }
    public void setQuantityRequested(Integer quantityRequested) { this.quantityRequested = quantityRequested; }
    
    public Integer getQuantityFulfilled() { return quantityFulfilled; }
    public void setQuantityFulfilled(Integer quantityFulfilled) { this.quantityFulfilled = quantityFulfilled; }
    
    public String getUnitOfMeasure() { return unitOfMeasure; }
    public void setUnitOfMeasure(String unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    // Business methods
    public boolean isFullyFulfilled() {
        return quantityFulfilled >= quantityRequested;
    }
    
    public boolean isPartiallyFulfilled() {
        return quantityFulfilled > 0 && quantityFulfilled < quantityRequested;
    }
    
    public Integer getRemainingQuantity() {
        return quantityRequested - quantityFulfilled;
    }
}

