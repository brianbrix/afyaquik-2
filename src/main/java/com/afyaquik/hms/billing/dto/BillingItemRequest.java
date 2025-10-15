package com.afyaquik.hms.billing.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class BillingItemRequest {
    
    @NotBlank(message = "Item code is required")
    private String itemCode;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotNull(message = "Unit price is required")
    @Positive(message = "Unit price must be positive")
    private BigDecimal unitPrice;
    
    private String serviceCategory;
    private Boolean isActive = true;

    // Constructors
    public BillingItemRequest() {}

    public BillingItemRequest(String itemCode, String description, BigDecimal unitPrice, String serviceCategory) {
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
}
