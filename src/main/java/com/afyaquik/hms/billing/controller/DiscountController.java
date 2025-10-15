package com.afyaquik.hms.billing.controller;

import com.afyaquik.hms.billing.dto.CreateDiscountRequest;
import com.afyaquik.hms.billing.dto.DiscountDto;
import com.afyaquik.hms.billing.service.DiscountService;
import com.afyaquik.hms.common.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/billing/bills/{billId}/discounts")
public class DiscountController {

    @Autowired
    private DiscountService discountService;

    @PostMapping
    @PreAuthorize("hasPermission(null,'MANAGE_BILLING')")
    public ResponseEntity<ApiResponse<DiscountDto>> createDiscount(
            @PathVariable Long billId,
            @Valid @RequestBody CreateDiscountRequest request,
            Authentication authentication) {
        String appliedBy = authentication.getName();
        DiscountDto discount = discountService.createDiscount(billId, request, appliedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(discount));
    }

    @GetMapping
    @PreAuthorize("hasPermission(null,'VIEW_BILLING')")
    public ResponseEntity<ApiResponse<List<DiscountDto>>> getDiscountsByBillId(@PathVariable Long billId) {
        List<DiscountDto> discounts = discountService.getDiscountsByBillId(billId);
        return ResponseEntity.ok(ApiResponse.success(discounts));
    }

    @DeleteMapping("/{discountId}")
    @PreAuthorize("hasPermission(null,'MANAGE_BILLING')")
    public ResponseEntity<ApiResponse<Void>> deleteDiscount(@PathVariable Long discountId) {
        discountService.deleteDiscount(discountId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
