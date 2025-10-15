package com.afyaquik.hms.billing.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

import com.afyaquik.hms.billing.domain.BillStatus;

/**
 * DTO for Bill entity.
 */
public record BillDto(
    Long id,
    String billNumber,
    Long patientId,
    String patientName,
    Long queueItemId,
    BillStatus status,
    BigDecimal subtotal,
    BigDecimal taxAmount,
    BigDecimal discountAmount,
    BigDecimal totalAmount,
    BigDecimal paidAmount,
    BigDecimal balanceDue,
    OffsetDateTime billingDate,
    OffsetDateTime dueDate,
    String paymentTerms,
    String notes,
    List<BillItemDto> items,
    List<PaymentDto> payments,
    List<DiscountDto> discounts,
    Instant createdAt,
    Instant updatedAt
) {
}
