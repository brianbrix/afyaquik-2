package com.afyaquik.hms.pharmacy.api;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/pharmacy/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/medication/{medicationId}")
    public ResponseEntity<ApiResponse<InventoryDto>> create(
            @PathVariable Long medicationId,
            @Valid @RequestBody InventoryDto request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        InventoryDto response = inventoryService.create(tenantId, medicationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody InventoryDto request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        InventoryDto response = inventoryService.update(tenantId, id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ApiResponse<InventoryDto> getById(@PathVariable Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(inventoryService.getById(tenantId, id));
    }

    @GetMapping("/medication/{medicationId}")
    public ApiResponse<InventoryDto> getByMedicationId(@PathVariable Long medicationId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(inventoryService.getByMedicationId(tenantId, medicationId));
    }

    @GetMapping
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
    public ApiResponse<List<InventoryDto>> search(@RequestParam("q") String searchTerm) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(inventoryService.search(tenantId, searchTerm));
    }

    @GetMapping("/search/page")
    public ApiResponse<Page<InventoryDto>> searchPaged(
            @RequestParam("q") String searchTerm,
            Pageable pageable) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(inventoryService.search(tenantId, searchTerm, pageable));
    }

    @PostMapping("/{id}/adjust")
    public ResponseEntity<ApiResponse<InventoryDto>> adjustStock(
            @PathVariable Long id,
            @RequestParam("quantity") int quantityChange,
            @RequestParam(value = "notes", required = false) String notes) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        InventoryDto response = inventoryService.adjustStock(tenantId, id, quantityChange, notes);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/suppliers")
    public ApiResponse<List<String>> getSuppliers() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(inventoryService.getSuppliers(tenantId));
    }

    @GetMapping("/locations")
    public ApiResponse<List<String>> getLocations() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(inventoryService.getLocations(tenantId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        inventoryService.delete(tenantId, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

