package com.afyaquik.hms.patient.api;

import com.afyaquik.hms.patient.dto.PatientInsuranceDetailsDto;
import com.afyaquik.hms.patient.service.PatientInsuranceDetailsService;
import com.afyaquik.hms.common.web.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1/patients")
public class PatientInsuranceController {

    private static final Logger logger = LoggerFactory.getLogger(PatientInsuranceController.class);

    @Autowired
    private PatientInsuranceDetailsService patientInsuranceService;


    @PostMapping("/{patientId}/insurance-details")
    public ResponseEntity<ApiResponse<PatientInsuranceDetailsDto>> saveInsuranceDetails(
        @PathVariable Long patientId,
        @RequestBody PatientInsuranceDetailsDto dto
    ) {
    logger.info("Received insurance details DTO: id={}, patientId={}, providerId={}, planId={}, policyNumber={}",
        dto.getId(), dto.getPatientId(), dto.getProviderId(), dto.getPlanId(), dto.getPolicyNumber());
    PatientInsuranceDetailsDto result = patientInsuranceService.saveInsuranceDetailsDto(patientId, dto);
    return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{patientId}/insurance-details")
    public ResponseEntity<ApiResponse<java.util.List<PatientInsuranceDetailsDto>>> getAllInsuranceDetails(
            @PathVariable Long patientId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
            patientInsuranceService.getAllInsuranceDetailsDto(patientId)
        ));
    }

    @DeleteMapping("/insurance-details/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInsuranceDetails(@PathVariable Long id) {
        boolean deleted = patientInsuranceService.deleteInsuranceDetails(id);
        if (deleted) return ResponseEntity.ok(ApiResponse.success(null));
        return ResponseEntity.status(404).body(ApiResponse.error("Insurance details not found"));
    }

}
