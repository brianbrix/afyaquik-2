package com.afyaquik.hms.patient.api;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.afyaquik.hms.patient.dto.PatientSummary;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.patient.service.PatientService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/patients")
public class PatientController {

        private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientResponse>> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody CreatePatientRequest request) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        PatientResponse response = patientService.update(tenantId, id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PatientResponse>> register(
            @Valid @RequestBody CreatePatientRequest request) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        PatientResponse response = patientService.register(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/{medicalRecordNumber}")
    public ApiResponse<PatientResponse> getPatient(
            @PathVariable String medicalRecordNumber) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(patientService.getByMrn(tenantId, medicalRecordNumber));
    }

    @GetMapping
    public ApiResponse<List<PatientSummary>> search(
            @RequestParam(value = "q", required = false) String query) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return ApiResponse.success(patientService.search(tenantId, query));
    }
}
