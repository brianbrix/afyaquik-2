package com.afyaquik.hms.billing.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "payment_methods")
public class PaymentMethod extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "code", nullable = false, length = 50, unique = true)
    private String code;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "requires_authorization")
    private Boolean requiresAuthorization = false;

    @Column(name = "processing_fee_percentage", precision = 5)
    private Double processingFeePercentage = 0.0;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    // Constructors
    public PaymentMethod() {}

    public PaymentMethod(String name, String code, String description) {
        this.name = name;
        this.code = code;
        this.description = description;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getRequiresAuthorization() {
        return requiresAuthorization;
    }

    public void setRequiresAuthorization(Boolean requiresAuthorization) {
        this.requiresAuthorization = requiresAuthorization;
    }

    public Double getProcessingFeePercentage() {
        return processingFeePercentage;
    }

    public void setProcessingFeePercentage(Double processingFeePercentage) {
        this.processingFeePercentage = processingFeePercentage;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}