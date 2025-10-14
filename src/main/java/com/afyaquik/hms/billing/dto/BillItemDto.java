package com.afyaquik.hms.billing.dto;

import java.math.BigDecimal;

/**
 * DTO for BillItem entity.
 */
public record BillItemDto(
    Long id,
    String itemCode,
    String description,
    BigDecimal quantity,
    BigDecimal unitPrice,
    BigDecimal discountPercentage,
    BigDecimal discountAmount,
    BigDecimal taxRate,
    BigDecimal taxAmount,
    BigDecimal lineTotal,
    String serviceCategory,
    String notes
) {
}
