package com.afyaquik.hms.triage.service;

import com.afyaquik.hms.triage.domain.TriageAssessment;
import com.afyaquik.hms.triage.repository.TriageAssessmentRepository;
import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TriageNotesService {

    private final TriageAssessmentRepository triageAssessmentRepository;
    private final PatientRepository patientRepository;

    /**
     * Add triage results to patient notes
     */
    public void addTriageResultsToPatientNotes(Long patientId, String tenantId) {
        try {
            Patient patient = patientRepository.findByIdAndTenantId(patientId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

            // Get recent triage assessments for this patient
            List<TriageAssessment> assessments = triageAssessmentRepository.findByPatientIdAndDeletedFalse(patientId);
            
            if (assessments.isEmpty()) {
                return;
            }

            // Generate triage summary
            StringBuilder triageSummary = new StringBuilder();
            triageSummary.append("\n\n=== TRIAGE ASSESSMENT SUMMARY ===\n");
            triageSummary.append("Assessment Date: ").append(LocalDateTime.now().toString()).append("\n\n");

            // Group by category
            assessments.stream()
                .collect(java.util.stream.Collectors.groupingBy(a -> a.getTriageItem().getCategory()))
                .forEach((category, categoryAssessments) -> {
                    triageSummary.append("--- ").append(category.toUpperCase()).append(" ---\n");
                    
                    for (TriageAssessment assessment : categoryAssessments) {
                        triageSummary.append("• ").append(assessment.getTriageItem().getName());
                        
                        if (assessment.getNumericValue() != null) {
                            triageSummary.append(": ").append(assessment.getNumericValue());
                            if (assessment.getTriageItem().getUnit() != null) {
                                triageSummary.append(" ").append(assessment.getTriageItem().getUnit());
                            }
                        } else if (assessment.getTextValue() != null) {
                            triageSummary.append(": ").append(assessment.getTextValue());
                        } else if (assessment.getBooleanValue() != null) {
                            triageSummary.append(": ").append(assessment.getBooleanValue() ? "Yes" : "No");
                        } else if (assessment.getSelectValue() != null) {
                            triageSummary.append(": ").append(assessment.getSelectValue());
                        }
                        
                        // Add status indicators
                        if (assessment.getIsCritical()) {
                            triageSummary.append(" 🔴 CRITICAL");
                        } else if (assessment.getIsWarning()) {
                            triageSummary.append(" 🟡 WARNING");
                        } else if (assessment.getIsAbnormal()) {
                            triageSummary.append(" 🟠 ABNORMAL");
                        } else {
                            triageSummary.append(" 🟢 NORMAL");
                        }
                        
                        // Add calculated result if present
                        if (assessment.getCalculatedResult() != null) {
                            triageSummary.append(" (").append(assessment.getCalculatedResult()).append(")");
                        }
                        
                        triageSummary.append("\n");
                        
                        // Add color-coded notes
                        if (assessment.getColorCodedNotes() != null && !assessment.getColorCodedNotes().trim().isEmpty()) {
                            triageSummary.append("  ").append(assessment.getColorCodedNotes()).append("\n");
                        }
                        
                        // Add assessment notes
                        if (assessment.getAssessmentNotes() != null && !assessment.getAssessmentNotes().trim().isEmpty()) {
                            triageSummary.append("  Notes: ").append(assessment.getAssessmentNotes()).append("\n");
                        }
                    }
                    triageSummary.append("\n");
                });

            // Add detected medical conditions
            List<String> medicalConditions = assessments.stream()
                .filter(a -> a.getDetectedMedicalConditions() != null && !a.getDetectedMedicalConditions().trim().isEmpty())
                .map(TriageAssessment::getDetectedMedicalConditions)
                .distinct()
                .collect(java.util.stream.Collectors.toList());

            if (!medicalConditions.isEmpty()) {
                triageSummary.append("=== DETECTED MEDICAL CONDITIONS ===\n");
                for (String condition : medicalConditions) {
                    triageSummary.append("• ").append(condition).append("\n");
                }
                triageSummary.append("\n");
            }

            // Add summary statistics
            long criticalCount = assessments.stream().mapToLong(a -> a.getIsCritical() ? 1 : 0).sum();
            long warningCount = assessments.stream().mapToLong(a -> a.getIsWarning() ? 1 : 0).sum();
            long abnormalCount = assessments.stream().mapToLong(a -> a.getIsAbnormal() ? 1 : 0).sum();
            long normalCount = assessments.stream().mapToLong(a -> a.getIsNormal() ? 1 : 0).sum();

            triageSummary.append("=== SUMMARY ===\n");
            triageSummary.append("Total Assessments: ").append(assessments.size()).append("\n");
            triageSummary.append("Critical: ").append(criticalCount).append("\n");
            triageSummary.append("Warning: ").append(warningCount).append("\n");
            triageSummary.append("Abnormal: ").append(abnormalCount).append("\n");
            triageSummary.append("Normal: ").append(normalCount).append("\n");
            triageSummary.append("===============================\n");

            // Append to patient notes
            String currentNotes = patient.getNotes() != null ? patient.getNotes() : "";
            patient.setNotes(currentNotes + triageSummary.toString());
            patientRepository.save(patient);

            log.info("Successfully added triage results to patient notes for patient {}", patientId);

        } catch (Exception e) {
            log.error("Error adding triage results to patient notes for patient {}: {}", patientId, e.getMessage(), e);
        }
    }
}