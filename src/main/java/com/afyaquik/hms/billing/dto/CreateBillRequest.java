package com.afyaquik.hms.billing.dto;

import java.time.OffsetDateTime;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating a new bill.
 */
public record CreateBillRequest(
    @NotNull(message = "Patient ID is required")
    Long patientId,

    @NotNull(message = "Patient name is required")
    @Size(max = 255, message = "Patient name must not exceed 255 characters")
    String patientName,

    Long queueItemId,

    OffsetDateTime billingDate,

    OffsetDateTime dueDate,

    @Size(max = 100, message = "Payment terms must not exceed 100 characters")
    String paymentTerms,

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    String notes,

    List<CreateBillItemRequest> items
) {
}
