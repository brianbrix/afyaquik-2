package com.afyaquik.hms.billing.domain;

import java.math.BigDecimal;

import com.afyaquik.hms.common.domain.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Represents a billing item that can be added to patient bills.
 * This is a master data entity for billing items.
 */
@Entity
@Table(name = "billing_items")
public class BillingItem extends BaseEntity {

    @Column(name = "item_code", nullable = false, length = 50, unique = true)
    private String itemCode;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @Column(name = "unit_price", precision = 19, scale = 2, nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "service_category", length = 100)
    private String serviceCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private BillingItemCategory category;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Constructors
    public BillingItem() {}

    public BillingItem(String itemCode, String description, BigDecimal unitPrice, String serviceCategory) {
        this.itemCode = itemCode;
        this.description = description;
        this.unitPrice = unitPrice;
        this.serviceCategory = serviceCategory;
    }

    // Getters and Setters
    public String getItemCode() {
        return itemCode;
    }

    public void setItemCode(String itemCode) {
        this.itemCode = itemCode;
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

    public String getServiceCategory() {
        return serviceCategory;
    }

    public void setServiceCategory(String serviceCategory) {
        this.serviceCategory = serviceCategory;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public BillingItemCategory getCategory() {
        return category;
    }

    public void setCategory(BillingItemCategory category) {
        this.category = category;
    }
}
