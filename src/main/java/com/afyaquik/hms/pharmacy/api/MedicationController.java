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

import com.afyaquik.hms.audit.annotation.Auditable;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.pharmacy.dto.MedicationDto;
import com.afyaquik.hms.pharmacy.dto.MedicationRequest;
import com.afyaquik.hms.pharmacy.service.MedicationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/pharmacy/medications")
@Auditable(entityType = "Medication", description = "Medication management operations")
public class MedicationController {

    private final MedicationService medicationService;

    public MedicationController(MedicationService medicationService) {
        this.medicationService = medicationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MedicationDto>> create(@Valid @RequestBody MedicationRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        MedicationDto response = medicationService.create(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicationDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody MedicationRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        MedicationDto response = medicationService.update(tenantId, id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ApiResponse<MedicationDto> getById(@PathVariable Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(medicationService.getById(tenantId, id));
    }

    @GetMapping("/code/{medicationCode}")
    public ApiResponse<MedicationDto> getByCode(@PathVariable String medicationCode) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(medicationService.getByCode(tenantId, medicationCode));
    }

    @GetMapping
    public ApiResponse<List<MedicationDto>> getAll(
            @RequestParam(value = "active", required = false) Boolean active,
            @RequestParam(value = "controlled", required = false) Boolean controlled,
            @RequestParam(value = "requiresPrescription", required = false) Boolean requiresPrescription) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        if (active != null && active) {
            return ApiResponse.success(medicationService.getActive(tenantId));
        } else if (controlled != null && controlled) {
            return ApiResponse.success(medicationService.getControlledSubstances(tenantId));
        } else if (requiresPrescription != null) {
            return ApiResponse.success(medicationService.getByPrescriptionRequirement(tenantId, requiresPrescription));
        } else {
            return ApiResponse.success(medicationService.getAll(tenantId));
        }
    }

    @GetMapping("/page")
    public ApiResponse<Page<MedicationDto>> getAllPaged(
            @RequestParam(value = "active", required = false) Boolean active,
            Pageable pageable) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        if (active != null && active) {
            return ApiResponse.success(medicationService.getActive(tenantId, pageable));
        } else {
            return ApiResponse.success(medicationService.getAll(tenantId, pageable));
        }
    }

    @GetMapping("/search")
    public ApiResponse<List<MedicationDto>> search(@RequestParam("q") String searchTerm) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(medicationService.search(tenantId, searchTerm));
    }

    @GetMapping("/search/page")
    public ApiResponse<Page<MedicationDto>> searchPaged(
            @RequestParam("q") String searchTerm,
            Pageable pageable) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(medicationService.search(tenantId, searchTerm, pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        medicationService.delete(tenantId, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

