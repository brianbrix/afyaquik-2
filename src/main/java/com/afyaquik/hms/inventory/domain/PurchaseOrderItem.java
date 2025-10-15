package com.afyaquik.hms.inventory.domain;

import java.math.BigDecimal;

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
@Table(name = "purchase_order_items")
public class PurchaseOrderItem extends BaseEntity implements TenantAwareEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;
    
    @NotNull
    @Positive
    @Column(name = "quantity_ordered", nullable = false)
    private Integer quantityOrdered;
    
    @Column(name = "quantity_received")
    private Integer quantityReceived = 0;
    
    @NotNull
    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice;
    
    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice;
    
    @Column(name = "notes")
    private String notes;
    
    // Constructors
    public PurchaseOrderItem() {}
    
    public PurchaseOrderItem(PurchaseOrder purchaseOrder, InventoryItem inventoryItem, 
                           Integer quantityOrdered, BigDecimal unitPrice) {
        this.purchaseOrder = purchaseOrder;
        this.inventoryItem = inventoryItem;
        this.quantityOrdered = quantityOrdered;
        this.unitPrice = unitPrice;
        this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantityOrdered));
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public PurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public void setPurchaseOrder(PurchaseOrder purchaseOrder) { this.purchaseOrder = purchaseOrder; }
    
    public InventoryItem getInventoryItem() { return inventoryItem; }
    public void setInventoryItem(InventoryItem inventoryItem) { this.inventoryItem = inventoryItem; }
    
    public Integer getQuantityOrdered() { return quantityOrdered; }
    public void setQuantityOrdered(Integer quantityOrdered) { this.quantityOrdered = quantityOrdered; }
    
    public Integer getQuantityReceived() { return quantityReceived; }
    public void setQuantityReceived(Integer quantityReceived) { this.quantityReceived = quantityReceived; }
    
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    // Business methods
    public void calculateTotalPrice() {
        this.totalPrice = this.unitPrice.multiply(BigDecimal.valueOf(this.quantityOrdered));
    }
    
    public boolean isFullyReceived() {
        return quantityReceived >= quantityOrdered;
    }
    
    public boolean isPartiallyReceived() {
        return quantityReceived > 0 && quantityReceived < quantityOrdered;
    }
    
    public Integer getRemainingQuantity() {
        return quantityOrdered - quantityReceived;
    }
}

