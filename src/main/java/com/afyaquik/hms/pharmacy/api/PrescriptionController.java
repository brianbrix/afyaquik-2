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
import com.afyaquik.hms.pharmacy.domain.Prescription;
import com.afyaquik.hms.pharmacy.dto.PrescriptionDto;
import com.afyaquik.hms.pharmacy.dto.PrescriptionRequest;
import com.afyaquik.hms.pharmacy.service.PrescriptionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/pharmacy/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PrescriptionDto>> create(@Valid @RequestBody PrescriptionRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        PrescriptionDto response = prescriptionService.create(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PrescriptionDto>> update(@PathVariable Long id, @Valid @RequestBody PrescriptionRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        PrescriptionDto response = prescriptionService.update(tenantId, id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ApiResponse<PrescriptionDto> getById(@PathVariable Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(prescriptionService.getById(tenantId, id));
    }

    @GetMapping("/number/{prescriptionNumber}")
    public ApiResponse<PrescriptionDto> getByNumber(@PathVariable String prescriptionNumber) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(prescriptionService.getByNumber(tenantId, prescriptionNumber));
    }

    @GetMapping
    public ApiResponse<List<PrescriptionDto>> getAll(
            @RequestParam(value = "patientId", required = false) Long patientId,
            @RequestParam(value = "status", required = false) Prescription.PrescriptionStatus status) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        if (patientId != null) {
            return ApiResponse.success(prescriptionService.getByPatient(tenantId, patientId));
        } else if (status != null) {
            return ApiResponse.success(prescriptionService.getByStatus(tenantId, status));
        } else {
            return ApiResponse.success(prescriptionService.getAll(tenantId));
        }
    }

    @GetMapping("/page")
    public ApiResponse<Page<PrescriptionDto>> getAllPaged(
            @RequestParam(value = "patientId", required = false) Long patientId,
            @RequestParam(value = "status", required = false) Prescription.PrescriptionStatus status,
            Pageable pageable) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        if (patientId != null) {
            return ApiResponse.success(prescriptionService.getByPatient(tenantId, patientId, pageable));
        } else if (status != null) {
            return ApiResponse.success(prescriptionService.getByStatus(tenantId, status, pageable));
        } else {
            return ApiResponse.success(prescriptionService.getAll(tenantId, pageable));
        }
    }

    @GetMapping("/search")
    public ApiResponse<List<PrescriptionDto>> search(@RequestParam("q") String searchTerm) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(prescriptionService.search(tenantId, searchTerm));
    }

    @GetMapping("/search/page")
    public ApiResponse<Page<PrescriptionDto>> searchPaged(
            @RequestParam("q") String searchTerm,
            Pageable pageable) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(prescriptionService.search(tenantId, searchTerm, pageable));
    }

    @PostMapping("/{id}/dispense")
    public ResponseEntity<ApiResponse<PrescriptionDto>> dispense(
            @PathVariable Long id,
            @RequestParam("dispensedBy") Long dispensedBy,
            @RequestParam(value = "notes", required = false) String dispensingNotes) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        PrescriptionDto response = prescriptionService.dispense(tenantId, id, dispensedBy, dispensingNotes);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<PrescriptionDto>> cancel(@PathVariable Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        PrescriptionDto response = prescriptionService.cancel(tenantId, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        prescriptionService.delete(tenantId, id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

