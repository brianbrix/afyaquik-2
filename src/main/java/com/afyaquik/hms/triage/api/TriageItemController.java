package com.afyaquik.hms.triage.api;

import com.afyaquik.hms.triage.domain.TriageItem;
import com.afyaquik.hms.triage.dto.TriageItemDto;
import com.afyaquik.hms.triage.dto.TriageItemRequest;
import com.afyaquik.hms.triage.service.TriageItemService;
import com.afyaquik.hms.common.web.ApiResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

@RestController
@RequestMapping("/api/v1/triage-items")
@RequiredArgsConstructor
@Slf4j
public class TriageItemController {

    private final TriageItemService triageItemService;

    /**
     * Create new triage item
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TriageItemDto>> createTriageItem(@RequestBody TriageItemRequest request) {
        String tenantId = "clinic-a"; // TODO: Get from security context
        TriageItemDto result = triageItemService.createTriageItem(request, TenantHeaderInterceptor.getCurrentTenant());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Update triage item
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TriageItemDto>> updateTriageItem(@PathVariable Long id, @RequestBody TriageItemRequest request) {
        String tenantId = "clinic-a"; // TODO: Get from security context
        TriageItemDto result = triageItemService.updateTriageItem(id, request, TenantHeaderInterceptor.getCurrentTenant());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Test endpoint to verify triage system is working
     */
    @GetMapping("/test")
    public ResponseEntity<String> testTriageSystem() {
        return ResponseEntity.ok("Triage system is working!");
    }

    /**
     * Get all active triage items
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TriageItemDto>>> getActiveTriageItems() {
        String tenantId = "clinic-a"; // TODO: Get from security context
        return ResponseEntity.ok(ApiResponse.success(triageItemService.getActiveTriageItems(TenantHeaderInterceptor.getCurrentTenant())));
    }

    /**
     * Get triage items by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<TriageItemDto>>> getTriageItemsByCategory(@PathVariable String category) {
        String tenantId = "clinic-a"; // TODO: Get from security context
        return ResponseEntity.ok(ApiResponse.success(triageItemService.getTriageItemsByCategory(category, TenantHeaderInterceptor.getCurrentTenant())));
    }

    /**
     * Get triage items by data type
     */
    @GetMapping("/data-type/{dataType}")
    public ResponseEntity<ApiResponse<List<TriageItemDto>>> getTriageItemsByDataType(@PathVariable TriageItem.TriageDataType dataType) {
        String tenantId = "clinic-a"; // TODO: Get from security context
        return ResponseEntity.ok(ApiResponse.success(triageItemService.getTriageItemsByDataType(dataType, TenantHeaderInterceptor.getCurrentTenant())));
    }

    /**
     * Get distinct categories
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getDistinctCategories() {
        String tenantId = "clinic-a"; // TODO: Get from security context
        return ResponseEntity.ok(ApiResponse.success(triageItemService.getDistinctCategories(TenantHeaderInterceptor.getCurrentTenant())));
    }

    /**
     * Get distinct data types
     */
    @GetMapping("/data-types")
    public ResponseEntity<ApiResponse<List<TriageItem.TriageDataType>>> getDistinctDataTypes() {
        String tenantId = "clinic-a"; // TODO: Get from security context
        return ResponseEntity.ok(ApiResponse.success(triageItemService.getDistinctDataTypes(TenantHeaderInterceptor.getCurrentTenant())));
    }

    /**
     * Delete triage item
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTriageItem(@PathVariable Long id) {
        String tenantId = "clinic-a"; // TODO: Get from security context
        triageItemService.deleteTriageItem(id, tenantId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}