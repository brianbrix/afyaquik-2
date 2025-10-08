package com.afyaquik.hms.patient.api;

import com.afyaquik.hms.common.web.TenantHeaderResolver;
import com.afyaquik.hms.patient.dto.PatientSummary;
import com.afyaquik.hms.patient.service.PatientService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

    @PostMapping
    public ResponseEntity<PatientResponse> register(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenant,
            @Valid @RequestBody CreatePatientRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenant);
        PatientResponse response = patientService.register(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{medicalRecordNumber}")
    public PatientResponse getPatient(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenant,
            @PathVariable String medicalRecordNumber) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenant);
        return patientService.getByMrn(tenantId, medicalRecordNumber);
    }

    @GetMapping
    public List<PatientSummary> search(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenant,
            @RequestParam(value = "q", required = false) String query) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenant);
        return patientService.search(tenantId, query);
    }
}
