package com.afyaquik.hms.billing.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating a bill item.
 */
public record CreateBillItemRequest(
    @Size(max = 50, message = "Item code must not exceed 50 characters")
    String itemCode,

    @NotNull(message = "Description is required")
    @Size(max = 500, message = "Description must not exceed 500 characters")
    String description,

    @NotNull(message = "Quantity is required")
    java.math.BigDecimal quantity,

    @NotNull(message = "Unit price is required")
    java.math.BigDecimal unitPrice,

    java.math.BigDecimal discountPercentage,

    java.math.BigDecimal discountAmount,

    java.math.BigDecimal taxRate,

    @Size(max = 100, message = "Service category must not exceed 100 characters")
    String serviceCategory,

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    String notes
) {
}
