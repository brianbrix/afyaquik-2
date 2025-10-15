package com.afyaquik.hms.billing.dto;

import com.afyaquik.hms.billing.domain.Discount;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateDiscountRequest {
    @NotBlank(message = "Description is required")
    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;
    
    @NotNull(message = "Discount type is required")
    private Discount.DiscountType type;
    
    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.00", message = "Discount value cannot be negative")
    private BigDecimal discountValue;
}
