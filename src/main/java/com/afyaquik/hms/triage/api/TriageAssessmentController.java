package com.afyaquik.hms.triage.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.triage.dto.TriageAssessmentDto;
import com.afyaquik.hms.triage.dto.TriageAssessmentRequest;
import com.afyaquik.hms.triage.service.TriageAssessmentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/triage-assessments")
@RequiredArgsConstructor
@Slf4j
public class TriageAssessmentController {

    private final TriageAssessmentService triageAssessmentService;

    /**
     * Create new triage assessment
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TriageAssessmentDto>> createTriageAssessment(@RequestBody TriageAssessmentRequest request) {
        return ResponseEntity.ok(triageAssessmentService.createTriageAssessment(request, TenantHeaderInterceptor.getCurrentTenant()));
    }

    /**
     * Update existing triage assessment
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TriageAssessmentDto>> updateTriageAssessment(
            @PathVariable Long id, 
            @RequestBody TriageAssessmentRequest request) {
        return ResponseEntity.ok(triageAssessmentService.updateTriageAssessment(id, request, TenantHeaderInterceptor.getCurrentTenant()));
    }

    /**
     * Get triage assessments for a patient
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<TriageAssessmentDto>>> getTriageAssessmentsForPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(triageAssessmentService.getTriageAssessmentsForPatient(patientId, TenantHeaderInterceptor.getCurrentTenant()));
    }

    /**
     * Get triage assessments by triage item
     */
    @GetMapping("/triage-item/{triageItemId}")
    public ResponseEntity<ApiResponse<List<TriageAssessmentDto>>> getTriageAssessmentsByItem(@PathVariable Long triageItemId) {
        return ResponseEntity.ok(triageAssessmentService.getTriageAssessmentsByItem(triageItemId, TenantHeaderInterceptor.getCurrentTenant()));
    }

    /**
     * Get assessments needing review
     */
    @GetMapping("/needing-review")
    public ResponseEntity<ApiResponse<List<TriageAssessmentDto>>> getAssessmentsNeedingReview() {
        return ResponseEntity.ok(triageAssessmentService.getAssessmentsNeedingReview(TenantHeaderInterceptor.getCurrentTenant()));
    }

    /**
     * Get calculation summary for a patient
     */
    @GetMapping("/patient/{patientId}/calculation-summary")
    public ResponseEntity<ApiResponse<Object>> getCalculationSummary(@PathVariable Long patientId) {
        return ResponseEntity.ok(triageAssessmentService.getCalculationSummary(patientId, TenantHeaderInterceptor.getCurrentTenant()));
    }

    /**
     * Recalculate assessments for a patient
     */
    @PostMapping("/patient/{patientId}/recalculate")
    public ResponseEntity<ApiResponse<Void>> recalculatePatientAssessments(@PathVariable Long patientId) {
        return ResponseEntity.ok(triageAssessmentService.recalculatePatientAssessments(patientId, TenantHeaderInterceptor.getCurrentTenant()));
    }
}
