package com.afyaquik.hms.inventory.api;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.inventory.dto.SupplierDto;
import com.afyaquik.hms.inventory.dto.SupplierRequest;
import com.afyaquik.hms.inventory.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory/suppliers")
public class SupplierController {
    
    @Autowired
    private SupplierService supplierService;
    
    @GetMapping
    public ApiResponse<List<SupplierDto>> getAllSuppliers() {
        return ApiResponse.success(supplierService.getAllSuppliers());
    }
    
    @GetMapping("/{id}")
    public ApiResponse<SupplierDto> getSupplierById(@PathVariable Long id) {
        return ApiResponse.success(supplierService.getSupplierById(id));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<SupplierDto>> createSupplier(@Valid @RequestBody SupplierRequest request) {
        SupplierDto response = supplierService.createSupplier(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }
    
    @PutMapping("/{id}")
    public ApiResponse<SupplierDto> updateSupplier(@PathVariable Long id, @Valid @RequestBody SupplierRequest request) {
        return ApiResponse.success(supplierService.updateSupplier(id, request));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

