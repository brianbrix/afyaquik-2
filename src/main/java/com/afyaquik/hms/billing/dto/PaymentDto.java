package com.afyaquik.hms.billing.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;

import com.afyaquik.hms.billing.domain.PaymentStatus;

/**
 * DTO for Payment entity.
 */
public record PaymentDto(
    Long id,
    String paymentNumber,
    BigDecimal amount,
    PaymentMethodDto paymentMethod,
    OffsetDateTime paymentDate,
    String referenceNumber,
    String notes,
    String processedBy,
    PaymentStatus status,
    Instant createdAt,
    Instant updatedAt
) {
}
