package com.afyaquik.hms.pharmacy.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.pharmacy.dto.InventoryDto;
import com.afyaquik.hms.pharmacy.service.InventoryService;
import com.afyaquik.hms.pharmacy.service.StockManagementService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/pharmacy/inventory")
public class InventoryController {

    private final InventoryService inventoryService;
    private final StockManagementService stockManagementService;

    public InventoryController(InventoryService inventoryService, StockManagementService stockManagementService) {
        this.inventoryService = inventoryService;
        this.stockManagementService = stockManagementService;
    }

    @PostMapping("/medication/{medicationId}")
    @PreAuthorize("hasPermission(null, 'MANAGE_MEDICATION_INVENTORY')")
    public ResponseEntity<ApiResponse<InventoryDto>> create(
            @PathVariable Long medicationId,
            @Valid @RequestBody InventoryDto request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        InventoryDto response = inventoryService.create(tenantId, medicationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasPermission(null,  'MANAGE_MEDICATION_INVENTORY')")
    public ResponseEntity<ApiResponse<InventoryDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody InventoryDto request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        InventoryDto response = inventoryService.update(tenantId, id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasPermission(#id, 'INVENTORY', 'VIEW_MEDICATION_INVENTORY')")
    public ApiResponse<InventoryDto> getById(@PathVariable Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(inventoryService.getById(tenantId, id));
    }

    @GetMapping("/medication/{medicationId}")
    @PreAuthorize("hasPermission(#medicationId, 'MEDICATION', 'VIEW_MEDICATION_INVENTORY')")
    public ApiResponse<InventoryDto> getByMedicationId(@PathVariable Long medicationId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(inventoryService.getByMedicationId(tenantId, medicationId));
    }

    @GetMapping
    @PreAuthorize("hasPermission(null, 'INVENTORY', 'VIEW_MEDICATION_INVENTORY')")
    public ApiResponse<List<InventoryDto>> getAll(
            @RequestParam(value = "lowStock", required = false) Boolean lowStock,
            @RequestParam(value = "needsReorder", required = false) Boolean needsReorder,
            @RequestParam(value = "expiring", required = false) Integer expiringDays,
            @RequestParam(value = "expired", required = false) Boolean expired,
            @RequestParam(value = "supplier", required = false) String supplier,
            @RequestParam(value = "location", required = false) String location) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        if (lowStock != null && lowStock) {
            return ApiResponse.success(inventoryService.getLowStock(tenantId));
        } else if (needsReorder != null && needsReorder) {
            return ApiResponse.success(inventoryService.getNeedingReorder(tenantId));
        } else if (expiringDays != null) {
            return ApiResponse.success(inventoryService.getExpiring(tenantId, expiringDays));
        } else if (expired != null && expired) {
            return ApiResponse.success(inventoryService.getExpired(tenantId));
        } else if (supplier != null) {
            return ApiResponse.success(inventoryService.getBySupplier(tenantId, supplier));
        } else if (location != null) {
            return ApiResponse.success(inventoryService.getByLocation(tenantId, location));
        } else {
            return ApiResponse.success(inventoryService.getAll(tenantId));
        }
    }

    @GetMapping("/page")
    @PreAuthorize("hasPermission(null,  'VIEW_MEDICATION_INVENTORY')")
    public ApiResponse<Page<InventoryDto>> getAllPaged(
            @RequestParam(value = "lowStock", required = false) Boolean lowStock,
            @RequestParam(value = "expiring", required = false) Integer expiringDays,
            Pageable pageable) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        if (lowStock != null && lowStock) {
            return ApiResponse.success(inventoryService.getLowStock(tenantId, pageable));
        } else if (expiringDays != null) {
            return ApiResponse.success(inventoryService.getExpiring(tenantId, expiringDays, pageable));
        } else {
            return ApiResponse.success(inventoryService.getAll(tenantId, pageable));
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasPermission(null, 'VIEW_MEDICATION_INVENTORY')")
    public ApiResponse<List<InventoryDto>> search(@RequestParam("q") String searchTerm) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(inventoryService.search(tenantId, searchTerm));
    }

    @GetMapping("/search/page")
    @PreAuthorize("hasPermission(null,  'VIEW_MEDICATION_INVENTORY')")
    public ApiResponse<Page<InventoryDto>> searchPaged(
            @RequestParam("q") String searchTerm,
            Pageable pageable) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(inventoryService.search(tenantId, searchTerm, pageable));
    }

    @PostMapping("/{id}/adjust")
    @PreAuthorize("hasPermission(null, 'MANAGE_MEDICATION_INVENTORY')")
    public ResponseEntity<ApiResponse<InventoryDto>> adjustStock(
            @PathVariable Long id,
            @RequestParam("quantity") int quantityChange,
            @RequestParam(value = "notes", required = false) String notes) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        InventoryDto response = inventoryService.adjustStock(tenantId, id, quantityChange, notes);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/suppliers")
    @PreAuthorize("hasPermission(null,  'VIEW_MEDICATION_INVENTORY')")
    public ApiResponse<List<String>> getSuppliers() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(inventoryService.getSuppliers(tenantId));
    }

    @GetMapping("/locations")
    @PreAuthorize("hasPermission(null, 'INVENTORY', 'VIEW_MEDICATION_INVENTORY')")
    public ApiResponse<List<String>> getLocations() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(inventoryService.getLocations(tenantId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasPermission(#id, 'INVENTORY', 'MANAGE_MEDICATION_INVENTORY')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        inventoryService.delete(tenantId, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/stock-check/{medicationId}")
    @PreAuthorize("hasPermission(null, 'VIEW_MEDICATION_INVENTORY')")
    public ApiResponse<Boolean> checkStockAvailability(
            @PathVariable Long medicationId,
            @RequestParam Integer quantity) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        boolean available = inventoryService.checkStockAvailability(tenantId, medicationId, quantity);
        return ApiResponse.success(available);
    }

    @GetMapping("/stock-level/{medicationId}")
    @PreAuthorize("hasPermission(null, 'VIEW_MEDICATION_INVENTORY')")
    public ApiResponse<Integer> getStockLevel(@PathVariable Long medicationId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        Integer stockLevel = inventoryService.getStockLevel(tenantId, medicationId);
        return ApiResponse.success(stockLevel);
    }

    @GetMapping("/batch-number/generate/{medicationId}")
    @PreAuthorize("hasPermission(null, 'MANAGE_MEDICATION_INVENTORY')")
    public ApiResponse<String> generateBatchNumber(@PathVariable Long medicationId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        String batchNumber = stockManagementService.generateBatchNumber(tenantId, medicationId);
        return ApiResponse.success(batchNumber);
    }

    @GetMapping("/batch-number/validate")
    @PreAuthorize("hasPermission(null, 'VIEW_MEDICATION_INVENTORY')")
    public ApiResponse<Boolean> validateBatchNumber(
            @RequestParam String batchNumber,
            @RequestParam(required = false) Long excludeInventoryId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        boolean isValid = stockManagementService.validateBatchNumber(tenantId, batchNumber, excludeInventoryId);
        return ApiResponse.success(isValid);
    }
}

