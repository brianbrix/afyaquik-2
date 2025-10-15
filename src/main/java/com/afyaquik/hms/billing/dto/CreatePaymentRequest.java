package com.afyaquik.hms.billing.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import com.afyaquik.hms.billing.domain.PaymentMethod;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating a payment.
 */
public record CreatePaymentRequest(
    @NotNull(message = "Amount is required")
    BigDecimal amount,

    @NotNull(message = "Payment method ID is required")
    Long paymentMethodId,

    @NotNull(message = "Payment date is required")
    OffsetDateTime paymentDate,

    @Size(max = 100, message = "Reference number must not exceed 100 characters")
    String referenceNumber,

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    String notes,

    @Size(max = 100, message = "Processed by must not exceed 100 characters")
    String processedBy
) {
}
