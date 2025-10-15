package com.afyaquik.hms.billing.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.billing.dto.BillingItemDto;
import com.afyaquik.hms.billing.dto.BillingItemRequest;
import com.afyaquik.hms.billing.service.BillingItemService;
import com.afyaquik.hms.common.web.ApiResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/billing/items")
public class BillingItemController {

    @Autowired
    private BillingItemService billingItemService;

    /**
     * Get all billing items.
     */
    @GetMapping
    @PreAuthorize("hasPermission(null,'VIEW_BILLING')")
    public ResponseEntity<ApiResponse<List<BillingItemDto>>> getAllBillingItems() {
        List<BillingItemDto> items = billingItemService.getAllBillingItems();
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    /**
     * Get billing item by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasPermission(null,'VIEW_BILLING')")
    public ResponseEntity<ApiResponse<BillingItemDto>> getBillingItemById(@PathVariable Long id) {
        BillingItemDto item = billingItemService.getBillingItemById(id);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    /**
     * Create a new billing item.
     */
    @PostMapping
    @PreAuthorize("hasPermission(null,'MANAGE_BILLING')")
    public ResponseEntity<ApiResponse<BillingItemDto>> createBillingItem(@Valid @RequestBody BillingItemRequest request) {
        BillingItemDto item = billingItemService.createBillingItem(request);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    /**
     * Update an existing billing item.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasPermission(null,'MANAGE_BILLING')")
    public ResponseEntity<ApiResponse<BillingItemDto>> updateBillingItem(
            @PathVariable Long id,
            @Valid @RequestBody BillingItemRequest request) {
        BillingItemDto item = billingItemService.updateBillingItem(id, request);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    /**
     * Delete a billing item.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission(null,'MANAGE_BILLING')")
    public ResponseEntity<ApiResponse<Void>> deleteBillingItem(@PathVariable Long id) {
        billingItemService.deleteBillingItem(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * Get billing items by service category.
     */
    @GetMapping("/category/{serviceCategory}")
    @PreAuthorize("hasPermission(null,'VIEW_BILLING')")
    public ResponseEntity<ApiResponse<List<BillingItemDto>>> getBillingItemsByCategory(
            @PathVariable String serviceCategory) {
        List<BillingItemDto> items = billingItemService.getBillingItemsByCategory(serviceCategory);
        return ResponseEntity.ok(ApiResponse.success(items));
    }
}
