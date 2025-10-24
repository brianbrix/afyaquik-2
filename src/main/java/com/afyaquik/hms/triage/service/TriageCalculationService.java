package com.afyaquik.hms.triage.service;

import com.afyaquik.hms.triage.domain.TriageAssessment;
import com.afyaquik.hms.triage.domain.TriageItem;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TriageCalculationService {

    private final ObjectMapper objectMapper;

    /**
     * Process calculations for a triage assessment
     */
    public void processCalculations(TriageAssessment assessment) {
        try {
            TriageItem triageItem = assessment.getTriageItem();
            
            // Set basic assessment flags based on values and thresholds
            setAssessmentFlags(assessment);
            
            // Process calculation formula if present
            if (triageItem.getCalculationFormula() != null && !triageItem.getCalculationFormula().trim().isEmpty()) {
                String calculatedResult = processCalculationFormula(assessment);
                assessment.setCalculatedResult(calculatedResult);
            }
            
            // Generate color-coded notes
            generateColorCodedNotes(assessment);
            
            // Detect medical conditions
            detectMedicalConditions(assessment);
            
        } catch (Exception e) {
            log.error("Error processing calculations for assessment {}: {}", assessment.getId(), e.getMessage(), e);
        }
    }

    /**
     * Set assessment flags based on values and thresholds
     */
    private void setAssessmentFlags(TriageAssessment assessment) {
        TriageItem triageItem = assessment.getTriageItem();
        Double numericValue = assessment.getNumericValue();
        
        if (numericValue != null && triageItem.getDataType() == TriageItem.TriageDataType.NUMERIC) {
            // Check critical thresholds
            if (isInCriticalRange(numericValue, triageItem)) {
                assessment.setIsCritical(true);
                assessment.setIsWarning(false);
                assessment.setIsAbnormal(true);
                assessment.setIsNormal(false);
            }
            // Check warning thresholds
            else if (isInWarningRange(numericValue, triageItem)) {
                assessment.setIsCritical(false);
                assessment.setIsWarning(true);
                assessment.setIsAbnormal(true);
                assessment.setIsNormal(false);
            }
            // Check normal range
            else if (isInNormalRange(numericValue, triageItem)) {
                assessment.setIsCritical(false);
                assessment.setIsWarning(false);
                assessment.setIsAbnormal(false);
                assessment.setIsNormal(true);
            }
            // Outside normal range but not warning/critical
            else {
                assessment.setIsCritical(false);
                assessment.setIsWarning(false);
                assessment.setIsAbnormal(true);
                assessment.setIsNormal(false);
            }
        } else {
            // For non-numeric values, set as normal by default
            assessment.setIsCritical(false);
            assessment.setIsWarning(false);
            assessment.setIsAbnormal(false);
            assessment.setIsNormal(true);
        }
    }

    /**
     * Check if value is in critical range
     */
    private boolean isInCriticalRange(Double value, TriageItem triageItem) {
        if (triageItem.getCriticalThresholdMin() != null && value < triageItem.getCriticalThresholdMin()) {
            return true;
        }
        if (triageItem.getCriticalThresholdMax() != null && value > triageItem.getCriticalThresholdMax()) {
            return true;
        }
        return false;
    }

    /**
     * Check if value is in warning range
     */
    private boolean isInWarningRange(Double value, TriageItem triageItem) {
        if (triageItem.getWarningThresholdMin() != null && value < triageItem.getWarningThresholdMin()) {
            return true;
        }
        if (triageItem.getWarningThresholdMax() != null && value > triageItem.getWarningThresholdMax()) {
            return true;
        }
        return false;
    }

    /**
     * Check if value is in normal range
     */
    private boolean isInNormalRange(Double value, TriageItem triageItem) {
        if (triageItem.getNormalRangeMin() != null && value < triageItem.getNormalRangeMin()) {
            return false;
        }
        if (triageItem.getNormalRangeMax() != null && value > triageItem.getNormalRangeMax()) {
            return false;
        }
        return true;
    }

    /**
     * Process calculation formula
     */
    private String processCalculationFormula(TriageAssessment assessment) {
        try {
            // This is a simplified formula processor
            // In a real implementation, you might use a more sophisticated expression evaluator
            String formula = assessment.getTriageItem().getCalculationFormula();
            Double value = assessment.getNumericValue();
            
            if (formula != null && value != null) {
                // Simple formula processing - can be enhanced
                if (formula.contains("BMI")) {
                    // BMI calculation example
                    return "BMI: " + String.format("%.1f", value);
                } else if (formula.contains("MAP")) {
                    // Mean Arterial Pressure calculation
                    return "MAP: " + String.format("%.1f", value);
                }
            }
            
            return "Calculated: " + value;
        } catch (Exception e) {
            log.error("Error processing calculation formula: {}", e.getMessage());
            return "Calculation error";
        }
    }

    /**
     * Generate color-coded notes based on assessment
     */
    private void generateColorCodedNotes(TriageAssessment assessment) {
        StringBuilder notes = new StringBuilder();
        
        if (assessment.getIsCritical()) {
            notes.append("🔴 CRITICAL: ");
        } else if (assessment.getIsWarning()) {
            notes.append("🟡 WARNING: ");
        } else if (assessment.getIsAbnormal()) {
            notes.append("🟠 ABNORMAL: ");
        } else {
            notes.append("🟢 NORMAL: ");
        }
        
        // Add specific medical condition notes
        TriageItem triageItem = assessment.getTriageItem();
        Double value = assessment.getNumericValue();
        
        if (value != null && triageItem.getName().toLowerCase().contains("temperature")) {
            if (value >= 38.0) {
                notes.append("Fever ≥ 38°C");
            } else if (value < 35.0) {
                notes.append("Hypothermia < 35°C");
            }
        } else if (value != null && triageItem.getName().toLowerCase().contains("heart rate")) {
            if (value > 100) {
                notes.append("Tachycardia > 100 bpm");
            } else if (value < 60) {
                notes.append("Bradycardia < 60 bpm");
            }
        }
        
        assessment.setColorCodedNotes(notes.toString());
    }

    /**
     * Detect medical conditions based on assessment
     */
    private void detectMedicalConditions(TriageAssessment assessment) {
        StringBuilder conditions = new StringBuilder();
        
        if (assessment.getIsCritical()) {
            conditions.append("Critical condition detected; ");
        }
        if (assessment.getIsWarning()) {
            conditions.append("Warning condition detected; ");
        }
        if (assessment.getIsAbnormal()) {
            conditions.append("Abnormal reading; ");
        }
        
        // Add specific condition detection
        TriageItem triageItem = assessment.getTriageItem();
        Double value = assessment.getNumericValue();
        
        if (value != null) {
            if (triageItem.getName().toLowerCase().contains("temperature") && value >= 38.0) {
                conditions.append("Fever; ");
            }
            if (triageItem.getName().toLowerCase().contains("heart rate") && value > 100) {
                conditions.append("Tachycardia; ");
            }
            if (triageItem.getName().toLowerCase().contains("blood pressure") && value > 140) {
                conditions.append("Hypertension; ");
            }
        }
        
        assessment.setDetectedMedicalConditions(conditions.toString());
    }
}