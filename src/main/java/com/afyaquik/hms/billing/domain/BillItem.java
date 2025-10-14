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
 * Represents a line item on a bill.
 */
@Entity
@Table(name = "bill_items")
public class BillItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    private Bill bill;

    @Column(name = "item_code", length = 50)
    private String itemCode;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @Column(name = "quantity", precision = 10, scale = 3, nullable = false)
    private BigDecimal quantity = BigDecimal.ONE;

    @Column(name = "unit_price", precision = 19, scale = 2, nullable = false)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 19, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 19, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "line_total", precision = 19, scale = 2, nullable = false)
    private BigDecimal lineTotal = BigDecimal.ZERO;

    @Column(name = "service_category", length = 100)
    private String serviceCategory;

    @Column(name = "notes", length = 500)
    private String notes;

    // Constructors
    public BillItem() {}

    public BillItem(String description, BigDecimal quantity, BigDecimal unitPrice) {
        this.description = description;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        calculateLineTotal();
    }

    // Getters and Setters
    public Bill getBill() {
        return bill;
    }

    public void setBill(Bill bill) {
        this.bill = bill;
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

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
        calculateLineTotal();
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
        calculateLineTotal();
    }

    public BigDecimal getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(BigDecimal discountPercentage) {
        this.discountPercentage = discountPercentage;
        calculateLineTotal();
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
        calculateLineTotal();
    }

    public BigDecimal getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(BigDecimal taxRate) {
        this.taxRate = taxRate;
        calculateLineTotal();
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getLineTotal() {
        return lineTotal;
    }

    public void setLineTotal(BigDecimal lineTotal) {
        this.lineTotal = lineTotal;
    }

    public String getServiceCategory() {
        return serviceCategory;
    }

    public void setServiceCategory(String serviceCategory) {
        this.serviceCategory = serviceCategory;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Helper methods
    public void calculateLineTotal() {
        // Calculate subtotal (quantity * unit price)
        BigDecimal subtotal = quantity.multiply(unitPrice);

        // Apply discount
        BigDecimal discount = BigDecimal.ZERO;
        if (discountPercentage.compareTo(BigDecimal.ZERO) > 0) {
            discount = subtotal.multiply(discountPercentage).divide(BigDecimal.valueOf(100));
        }
        if (discountAmount.compareTo(BigDecimal.ZERO) > 0) {
            discount = discountAmount;
        }

        BigDecimal afterDiscount = subtotal.subtract(discount);

        // Apply tax
        if (taxRate.compareTo(BigDecimal.ZERO) > 0) {
            taxAmount = afterDiscount.multiply(taxRate).divide(BigDecimal.valueOf(100));
        }

        // Calculate final line total
        lineTotal = afterDiscount.add(taxAmount);
    }
}
