package com.afyaquik.hms.billing.domain;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import com.afyaquik.hms.common.domain.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/**
 * Represents a bill for services provided to a patient.
 * Extends BaseEntity to inherit tenant scoping and audit timestamps.
 */
@Entity
@Table(name = "bills")
public class Bill extends BaseEntity {

    @Column(name = "bill_number", nullable = false, unique = true, length = 50)
    private String billNumber;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "patient_name", nullable = false, length = 255)
    private String patientName;

    @Column(name = "queue_item_id")
    private Long queueItemId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private BillStatus status = BillStatus.DRAFT;

    @Column(name = "subtotal", precision = 19, scale = 2, nullable = false)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 19, scale = 2, nullable = false)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 19, scale = 2, nullable = false)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 19, scale = 2, nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "paid_amount", precision = 19, scale = 2, nullable = false)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "balance_due", precision = 19, scale = 2, nullable = false)
    private BigDecimal balanceDue = BigDecimal.ZERO;

    @Column(name = "billing_date")
    private OffsetDateTime billingDate;

    @Column(name = "due_date")
    private OffsetDateTime dueDate;

    @Column(name = "payment_terms", length = 100)
    private String paymentTerms;

    @Column(name = "notes", length = 1000)
    private String notes;

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<BillItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Payment> payments = new ArrayList<>();

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Discount> discounts = new ArrayList<>();

    // Constructors
    public Bill() {}

    public Bill(String billNumber, Long patientId, String patientName) {
        this.billNumber = billNumber;
        this.patientId = patientId;
        this.patientName = patientName;
    }

    // Getters and Setters
    public String getBillNumber() {
        return billNumber;
    }

    public void setBillNumber(String billNumber) {
        this.billNumber = billNumber;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public Long getQueueItemId() {
        return queueItemId;
    }

    public void setQueueItemId(Long queueItemId) {
        this.queueItemId = queueItemId;
    }

    public BillStatus getStatus() {
        return status;
    }

    public void setStatus(BillStatus status) {
        this.status = status;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public BigDecimal getBalanceDue() {
        return balanceDue;
    }

    public void setBalanceDue(BigDecimal balanceDue) {
        this.balanceDue = balanceDue;
    }

    public OffsetDateTime getBillingDate() {
        return billingDate;
    }

    public void setBillingDate(OffsetDateTime billingDate) {
        this.billingDate = billingDate;
    }

    public OffsetDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(OffsetDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public String getPaymentTerms() {
        return paymentTerms;
    }

    public void setPaymentTerms(String paymentTerms) {
        this.paymentTerms = paymentTerms;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<BillItem> getItems() {
        return items;
    }

    public void setItems(List<BillItem> items) {
        this.items = items;
    }

    public List<Payment> getPayments() {
        return payments;
    }

    public void setPayments(List<Payment> payments) {
        this.payments = payments;
    }

    public List<Discount> getDiscounts() {
        return discounts;
    }

    public void setDiscounts(List<Discount> discounts) {
        this.discounts = discounts;
    }

    // Helper methods
    public void addItem(BillItem item) {
        items.add(item);
        item.setBill(this);
        recalculateAmounts();
    }

    public void removeItem(BillItem item) {
        items.remove(item);
        item.setBill(null);
        recalculateAmounts();
    }

    public void addPayment(Payment payment) {
        payments.add(payment);
        payment.setBill(this);
        recalculateAmounts();
    }

    public void recalculateAmounts() {
        // Calculate subtotal from items
        subtotal = items.stream()
            .map(BillItem::getLineTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate total amount
        totalAmount = subtotal.add(taxAmount).subtract(discountAmount);

        // Calculate paid amount from payments
        paidAmount = payments.stream()
            .map(Payment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate balance due
        balanceDue = totalAmount.subtract(paidAmount);
    }
}
