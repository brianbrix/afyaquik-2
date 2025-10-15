package com.afyaquik.hms.billing.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Represents a discount applied to a bill.
 */
@Entity
@Table(name = "discounts")
@Getter
@Setter
public class Discount extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    private Bill bill;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiscountType type;

    @NotNull
    @DecimalMin(value = "0.00")
    @Column(name = "discount_value", nullable = false, precision = 19, scale = 2)
    private BigDecimal discountValue;

    @NotNull
    @DecimalMin(value = "0.00")
    @Column(name = "discount_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal discountAmount;

    @NotBlank
    @Size(max = 100)
    @Column(name = "applied_by", nullable = false, length = 100)
    private String appliedBy;

    @Column(name = "applied_at", nullable = false)
    private java.time.OffsetDateTime appliedAt;

    public enum DiscountType {
        PERCENTAGE,
        FIXED
    }

    // Constructors
    public Discount() {}

    public Discount(String description, DiscountType type, BigDecimal discountValue, BigDecimal discountAmount, String appliedBy) {
        this.description = description;
        this.type = type;
        this.discountValue = discountValue;
        this.discountAmount = discountAmount;
        this.appliedBy = appliedBy;
        this.appliedAt = java.time.OffsetDateTime.now();
    }
}
