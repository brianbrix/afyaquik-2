package com.afyaquik.hms.billing.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class BillingItemDto {
    private Long id;
    private String itemCode;
    private String description;
    private BigDecimal unitPrice;
    private String serviceCategory;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    // Constructors
    public BillingItemDto() {}

    public BillingItemDto(Long id, String itemCode, String description, BigDecimal unitPrice, 
                         String serviceCategory, Boolean isActive) {
        this.id = id;
        this.itemCode = itemCode;
        this.description = description;
        this.unitPrice = unitPrice;
        this.serviceCategory = serviceCategory;
        this.isActive = isActive;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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
