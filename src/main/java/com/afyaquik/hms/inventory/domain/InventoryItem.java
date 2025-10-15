package com.afyaquik.hms.inventory.domain;

import java.math.BigDecimal;

import com.afyaquik.hms.common.domain.BaseEntity;
import com.afyaquik.hms.common.domain.TenantAwareEntity;
import com.afyaquik.hms.auth.domain.Department;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

@Entity
@Table(name = "inventory_items")
public class InventoryItem extends BaseEntity implements TenantAwareEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(name = "item_code", unique = true, nullable = false)
    private String itemCode;
    
    @NotBlank
    @Column(name = "item_name", nullable = false)
    private String itemName;
    
    @Column(name = "description")
    private String description;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ItemCategory category;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
    
    @Column(name = "unit_of_measure")
    private String unitOfMeasure;
    
    @NotNull
    @PositiveOrZero
    @Column(name = "current_stock", nullable = false)
    private Integer currentStock = 0;
    
    @NotNull
    @PositiveOrZero
    @Column(name = "minimum_stock_level", nullable = false)
    private Integer minimumStockLevel = 0;
    
    @NotNull
    @PositiveOrZero
    @Column(name = "maximum_stock_level", nullable = false)
    private Integer maximumStockLevel = 0;
    
    @NotNull
    @Column(name = "unit_cost", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitCost = BigDecimal.ZERO;
    
    @NotNull
    @Column(name = "unit_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal unitPrice = BigDecimal.ZERO;
    
    @Column(name = "barcode")
    private String barcode;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "is_controlled_substance")
    private Boolean isControlledSubstance = false;
    
    @Column(name = "requires_prescription")
    private Boolean requiresPrescription = false;
    
    @Column(name = "storage_location")
    private String storageLocation;
    
    @Column(name = "expiry_date")
    private java.time.LocalDate expiryDate;
    
    @Column(name = "batch_number")
    private String batchNumber;
    
    @Column(name = "notes")
    private String notes;
    
    // Constructors
    public InventoryItem() {}
    
    public InventoryItem(String itemCode, String itemName, ItemCategory category, 
                        Supplier supplier, Department department) {
        this.itemCode = itemCode;
        this.itemName = itemName;
        this.category = category;
        this.supplier = supplier;
        this.department = department;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getItemCode() { return itemCode; }
    public void setItemCode(String itemCode) { this.itemCode = itemCode; }
    
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public ItemCategory getCategory() { return category; }
    public void setCategory(ItemCategory category) { this.category = category; }
    
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    
    public String getUnitOfMeasure() { return unitOfMeasure; }
    public void setUnitOfMeasure(String unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; }
    
    public Integer getCurrentStock() { return currentStock; }
    public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }
    
    public Integer getMinimumStockLevel() { return minimumStockLevel; }
    public void setMinimumStockLevel(Integer minimumStockLevel) { this.minimumStockLevel = minimumStockLevel; }
    
    public Integer getMaximumStockLevel() { return maximumStockLevel; }
    public void setMaximumStockLevel(Integer maximumStockLevel) { this.maximumStockLevel = maximumStockLevel; }
    
    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
    
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    
    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public Boolean getIsControlledSubstance() { return isControlledSubstance; }
    public void setIsControlledSubstance(Boolean isControlledSubstance) { this.isControlledSubstance = isControlledSubstance; }
    
    public Boolean getRequiresPrescription() { return requiresPrescription; }
    public void setRequiresPrescription(Boolean requiresPrescription) { this.requiresPrescription = requiresPrescription; }
    
    public String getStorageLocation() { return storageLocation; }
    public void setStorageLocation(String storageLocation) { this.storageLocation = storageLocation; }
    
    public java.time.LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(java.time.LocalDate expiryDate) { this.expiryDate = expiryDate; }
    
    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    // Business methods
    public boolean isLowStock() {
        return currentStock <= minimumStockLevel;
    }
    
    public boolean isOverstocked() {
        return currentStock >= maximumStockLevel;
    }
    
    public void adjustStock(Integer quantity) {
        this.currentStock += quantity;
        if (this.currentStock < 0) {
            this.currentStock = 0;
        }
    }
}
