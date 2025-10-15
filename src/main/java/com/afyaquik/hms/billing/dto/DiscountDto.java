package com.afyaquik.hms.billing.dto;

import com.afyaquik.hms.billing.domain.Discount;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class DiscountDto {
    private Long id;
    private Long billId;
    
    @NotBlank(message = "Description is required")
    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;
    
    @NotNull(message = "Discount type is required")
    private Discount.DiscountType type;
    
    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.00", message = "Discount value cannot be negative")
    private BigDecimal discountValue;
    
    @NotNull(message = "Discount amount is required")
    @DecimalMin(value = "0.00", message = "Discount amount cannot be negative")
    private BigDecimal discountAmount;
    
    @NotBlank(message = "Applied by is required")
    @Size(max = 100, message = "Applied by cannot exceed 100 characters")
    private String appliedBy;
    
    private OffsetDateTime appliedAt;
}
