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
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.billing.dto.BillingItemCategoryDto;
import com.afyaquik.hms.billing.dto.BillingItemCategoryRequest;
import com.afyaquik.hms.billing.service.BillingItemCategoryService;
import com.afyaquik.hms.common.web.ApiResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/billing/item-categories")
public class BillingItemCategoryController {

    @Autowired
    private BillingItemCategoryService billingItemCategoryService;

    /**
     * Get all billing item categories.
     */
    @GetMapping
    @PreAuthorize("hasPermission(null,'VIEW_BILLING')")
    public ResponseEntity<ApiResponse<List<BillingItemCategoryDto>>> getAllCategories() {
        List<BillingItemCategoryDto> categories = billingItemCategoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    /**
     * Get active billing item categories.
     */
    @GetMapping("/active")
    @PreAuthorize("hasPermission(null,'VIEW_BILLING')")
    public ResponseEntity<ApiResponse<List<BillingItemCategoryDto>>> getActiveCategories() {
        List<BillingItemCategoryDto> categories = billingItemCategoryService.getActiveCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    /**
     * Get billing item category by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasPermission(null,'VIEW_BILLING')")
    public ResponseEntity<ApiResponse<BillingItemCategoryDto>> getCategoryById(@PathVariable Long id) {
        BillingItemCategoryDto category = billingItemCategoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    /**
     * Create a new billing item category.
     */
    @PostMapping
    @PreAuthorize("hasPermission(null,'MANAGE_BILLING')")
    public ResponseEntity<ApiResponse<BillingItemCategoryDto>> createCategory(@Valid @RequestBody BillingItemCategoryRequest request) {
        BillingItemCategoryDto category = billingItemCategoryService.createCategory(request);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    /**
     * Update an existing billing item category.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasPermission(null,'MANAGE_BILLING')")
    public ResponseEntity<ApiResponse<BillingItemCategoryDto>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody BillingItemCategoryRequest request) {
        BillingItemCategoryDto category = billingItemCategoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    /**
     * Delete a billing item category.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission(null,'MANAGE_BILLING')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        billingItemCategoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
