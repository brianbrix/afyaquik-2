package com.afyaquik.hms.triage.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.patient.repository.PatientRepository;
import com.afyaquik.hms.triage.domain.TriageAssessment;
import com.afyaquik.hms.triage.domain.TriageItem;
import com.afyaquik.hms.triage.dto.TriageAssessmentDto;
import com.afyaquik.hms.triage.dto.TriageAssessmentRequest;
import com.afyaquik.hms.triage.repository.TriageAssessmentRepository;
import com.afyaquik.hms.triage.repository.TriageItemRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TriageAssessmentService {

    private final TriageAssessmentRepository triageAssessmentRepository;
    private final TriageItemRepository triageItemRepository;
    private final PatientRepository patientRepository;
    private final StaffUserRepository staffUserRepository;
    private final TriageCalculationService triageCalculationService;
    private final TriageNotesService triageNotesService;

    /**
     * Create a new triage assessment
     */
    public ApiResponse<TriageAssessmentDto> createTriageAssessment(TriageAssessmentRequest request, String tenantId) {
        try {
            log.info("Creating triage assessment for patient {} with triage item {}", 
                request.getPatientId(), request.getTriageItemId());

            // Validate patient exists
            Patient patient = patientRepository.findByIdAndTenantId(request.getPatientId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

            // Validate triage item exists and is active
            TriageItem triageItem = triageItemRepository.findByIdAndTenantId(request.getTriageItemId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Triage item not found"));

            // Validate staff exists
            StaffUser staff = staffUserRepository.findByIdAndTenantId(request.getStaffId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));

            // Create triage assessment
            TriageAssessment assessment = new TriageAssessment();
            assessment.setTenantId(tenantId);
            assessment.setPatient(patient);
            assessment.setTriageItem(triageItem);
            assessment.setStaff(staff);
            assessment.setNumericValue(request.getNumericValue());
            assessment.setTextValue(request.getTextValue());
            assessment.setBooleanValue(request.getBooleanValue());
            assessment.setSelectValue(request.getSelectValue());
            assessment.setAssessmentNotes(request.getAssessmentNotes());
            assessment.setStaffNotes(request.getStaffNotes());
            assessment.setTriageTimestamp(request.getTriageTimestamp() != null ? 
                request.getTriageTimestamp() : LocalDateTime.now());

            // Process calculations
            triageCalculationService.processCalculations(assessment);

            // Save assessment
            TriageAssessment savedAssessment = triageAssessmentRepository.save(assessment);

            // Add to patient notes
            triageNotesService.addTriageResultsToPatientNotes(patient.getId(), tenantId);

            log.info("Successfully created triage assessment with ID {}", savedAssessment.getId());
            return ApiResponse.success(convertToDto(savedAssessment));

        } catch (Exception e) {
            log.error("Error creating triage assessment: {}", e.getMessage(), e);
            return ApiResponse.error("Failed to create triage assessment: " + e.getMessage());
        }
    }

    /**
     * Update existing triage assessment
     */
    public ApiResponse<TriageAssessmentDto> updateTriageAssessment(Long id, TriageAssessmentRequest request, String tenantId) {
        try {
            log.info("Updating triage assessment {} for patient {} with triage item {}", 
                id, request.getPatientId(), request.getTriageItemId());

            // Get existing assessment
            TriageAssessment assessment = triageAssessmentRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Triage assessment not found"));

            // Validate patient exists
            Patient patient = patientRepository.findByIdAndTenantId(request.getPatientId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

            // Validate triage item exists and is active
            TriageItem triageItem = triageItemRepository.findByIdAndTenantId(request.getTriageItemId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Triage item not found"));

            // Validate staff exists
            StaffUser staff = staffUserRepository.findByIdAndTenantId(request.getStaffId(), tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found"));

            // Update triage assessment
            assessment.setPatient(patient);
            assessment.setTriageItem(triageItem);
            assessment.setStaff(staff);
            assessment.setNumericValue(request.getNumericValue());
            assessment.setTextValue(request.getTextValue());
            assessment.setBooleanValue(request.getBooleanValue());
            assessment.setSelectValue(request.getSelectValue());
            assessment.setAssessmentNotes(request.getAssessmentNotes());
            assessment.setStaffNotes(request.getStaffNotes());
            assessment.setTriageTimestamp(request.getTriageTimestamp() != null ? 
                request.getTriageTimestamp() : LocalDateTime.now());

            // Process calculations
            triageCalculationService.processCalculations(assessment);

            // Save assessment
            TriageAssessment savedAssessment = triageAssessmentRepository.save(assessment);

            // Add to patient notes
            triageNotesService.addTriageResultsToPatientNotes(patient.getId(), tenantId);

            log.info("Successfully updated triage assessment with ID {}", savedAssessment.getId());
            return ApiResponse.success(convertToDto(savedAssessment));

        } catch (Exception e) {
            log.error("Error updating triage assessment {}: {}", id, e.getMessage(), e);
            return ApiResponse.error("Failed to update triage assessment: " + e.getMessage());
        }
    }

    /**
     * Get triage assessments for a patient
     */
    @Transactional(readOnly = true)
    public ApiResponse<List<TriageAssessmentDto>> getTriageAssessmentsForPatient(Long patientId, String tenantId) {
        try {
            List<TriageAssessment> assessments = triageAssessmentRepository.findByPatientIdAndDeletedFalse(patientId);
            List<TriageAssessmentDto> dtos = assessments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            
            return ApiResponse.success(dtos);
        } catch (Exception e) {
            log.error("Error fetching triage assessments for patient {}: {}", patientId, e.getMessage(), e);
            return ApiResponse.error("Failed to fetch triage assessments: " + e.getMessage());
        }
    }

    /**
     * Get triage assessments by triage item
     */
    @Transactional(readOnly = true)
    public ApiResponse<List<TriageAssessmentDto>> getTriageAssessmentsByItem(Long triageItemId, String tenantId) {
        try {
            // Get triage item first
            TriageItem triageItem = triageItemRepository.findByIdAndTenantId(triageItemId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Triage item not found"));
            
            List<TriageAssessment> assessments = triageAssessmentRepository.findByTriageItemOrderByTriageTimestampDesc(triageItem);
            List<TriageAssessmentDto> dtos = assessments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            
            return ApiResponse.success(dtos);
        } catch (Exception e) {
            log.error("Error fetching triage assessments for item {}: {}", triageItemId, e.getMessage(), e);
            return ApiResponse.error("Failed to fetch triage assessments: " + e.getMessage());
        }
    }

    /**
     * Get assessments needing review
     */
    @Transactional(readOnly = true)
    public ApiResponse<List<TriageAssessmentDto>> getAssessmentsNeedingReview(String tenantId) {
        try {
            List<TriageAssessment> assessments = triageAssessmentRepository.findAssessmentsNeedingReview(tenantId);
            List<TriageAssessmentDto> dtos = assessments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            
            return ApiResponse.success(dtos);
        } catch (Exception e) {
            log.error("Error fetching assessments needing review: {}", e.getMessage(), e);
            return ApiResponse.error("Failed to fetch assessments needing review: " + e.getMessage());
        }
    }

    /**
     * Get calculation summary for a patient
     */
    @Transactional(readOnly = true)
    public ApiResponse<Object> getCalculationSummary(Long patientId, String tenantId) {
        try {
            List<TriageAssessment> assessments = triageAssessmentRepository.findByPatientIdAndDeletedFalse(patientId);
            
            // Calculate summary statistics
            long total = assessments.size();
            long critical = assessments.stream().mapToLong(a -> a.getIsCritical() ? 1 : 0).sum();
            long warning = assessments.stream().mapToLong(a -> a.getIsWarning() ? 1 : 0).sum();
            long abnormal = assessments.stream().mapToLong(a -> a.getIsAbnormal() ? 1 : 0).sum();
            long normal = total - critical - warning - abnormal;
            
            return ApiResponse.success(new Object() {
                public final long totalAssessments = total;
                public final long criticalCount = critical;
                public final long warningCount = warning;
                public final long abnormalCount = abnormal;
                public final long normalCount = normal;
            });
        } catch (Exception e) {
            log.error("Error calculating summary for patient {}: {}", patientId, e.getMessage(), e);
            return ApiResponse.error("Failed to calculate summary: " + e.getMessage());
        }
    }

    /**
     * Recalculate assessments for a patient
     */
    public ApiResponse<Void> recalculatePatientAssessments(Long patientId, String tenantId) {
        try {
            List<TriageAssessment> assessments = triageAssessmentRepository.findByPatientIdAndDeletedFalse(patientId);
            
            for (TriageAssessment assessment : assessments) {
                triageCalculationService.processCalculations(assessment);
                triageAssessmentRepository.save(assessment);
            }
            
            // Update patient notes
            triageNotesService.addTriageResultsToPatientNotes(patientId, tenantId);
            
            log.info("Successfully recalculated {} assessments for patient {}", assessments.size(), patientId);
            return ApiResponse.success(null);
        } catch (Exception e) {
            log.error("Error recalculating assessments for patient {}: {}", patientId, e.getMessage(), e);
            return ApiResponse.error("Failed to recalculate assessments: " + e.getMessage());
        }
    }

    /**
     * Convert TriageAssessment entity to DTO
     */
    private TriageAssessmentDto convertToDto(TriageAssessment assessment) {
        TriageAssessmentDto dto = new TriageAssessmentDto();
        dto.setId(assessment.getId());
        dto.setPatientId(assessment.getPatient().getId());
        dto.setPatientName(assessment.getPatient().getFirstName() + " " + assessment.getPatient().getLastName());
        dto.setPatientMrn(assessment.getPatient().getMedicalRecordNumber());
        dto.setTriageItemId(assessment.getTriageItem().getId());
        dto.setTriageItemName(assessment.getTriageItem().getName());
        dto.setTriageItemCategory(assessment.getTriageItem().getCategory());
        dto.setTriageItemUnit(assessment.getTriageItem().getUnit());
        dto.setStaffId(assessment.getStaff().getId());
        dto.setStaffName(assessment.getStaff().getDisplayName());
        dto.setNumericValue(assessment.getNumericValue());
        dto.setTextValue(assessment.getTextValue());
        dto.setBooleanValue(assessment.getBooleanValue());
        dto.setSelectValue(assessment.getSelectValue());
        dto.setCalculatedResult(assessment.getCalculatedResult());
        
        // Set display value based on the actual value
        String displayValue = getDisplayValue(assessment);
        dto.setDisplayValue(displayValue);
        dto.setIsNormal(assessment.getIsNormal());
        dto.setIsAbnormal(assessment.getIsAbnormal());
        dto.setIsWarning(assessment.getIsWarning());
        dto.setIsCritical(assessment.getIsCritical());
        
        // Set status color and text based on assessment flags
        if (assessment.getIsCritical() != null && assessment.getIsCritical()) {
            dto.setStatusColor("danger");
            dto.setStatusText("Critical");
        } else if (assessment.getIsWarning() != null && assessment.getIsWarning()) {
            dto.setStatusColor("warning");
            dto.setStatusText("Warning");
        } else if (assessment.getIsAbnormal() != null && assessment.getIsAbnormal()) {
            dto.setStatusColor("warning");
            dto.setStatusText("Abnormal");
        } else if (assessment.getIsNormal() != null && assessment.getIsNormal()) {
            dto.setStatusColor("success");
            dto.setStatusText("Normal");
        } else {
            dto.setStatusColor("secondary");
            dto.setStatusText("Unknown");
        }
        dto.setAssessmentNotes(assessment.getAssessmentNotes());
        dto.setStaffNotes(assessment.getStaffNotes());
        dto.setTriageTimestamp(assessment.getTriageTimestamp());
        dto.setColorCodedNotes(assessment.getColorCodedNotes());
        dto.setDetectedMedicalConditions(assessment.getDetectedMedicalConditions());
        dto.setQueueItemId(assessment.getQueueItem() != null ? assessment.getQueueItem().getId() : null);
        dto.setCreatedAt(assessment.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        dto.setUpdatedAt(assessment.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        
        return dto;
    }
    
    /**
     * Get display value for the assessment based on the data type
     */
    private String getDisplayValue(TriageAssessment assessment) {
        if (assessment.getNumericValue() != null) {
            return String.valueOf(assessment.getNumericValue());
        }
        if (assessment.getTextValue() != null && !assessment.getTextValue().trim().isEmpty()) {
            return assessment.getTextValue();
        }
        if (assessment.getBooleanValue() != null) {
            return assessment.getBooleanValue() ? "Yes" : "No";
        }
        if (assessment.getSelectValue() != null && !assessment.getSelectValue().trim().isEmpty()) {
            return assessment.getSelectValue();
        }
        return "Not recorded";
    }
}
