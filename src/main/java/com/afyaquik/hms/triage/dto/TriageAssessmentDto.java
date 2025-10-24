package com.afyaquik.hms.triage.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class TriageAssessmentDto {
    private Long id;
    private Long patientId;
    private String patientName;
    private String patientMrn;
    private Long triageItemId;
    private String triageItemName;
    private String triageItemCategory;
    private String triageItemUnit;
    private Long staffId;
    private String staffName;
    private Double numericValue;
    private String textValue;
    private Boolean booleanValue;
    private String selectValue;
    private String displayValue;
    private String calculatedResult;
    private Boolean isNormal;
    private Boolean isAbnormal;
    private Boolean isWarning;
    private Boolean isCritical;
    private String assessmentNotes;
    private String staffNotes;
    private String statusColor;
    private String statusText;
    private LocalDateTime triageTimestamp;
    private String colorCodedNotes;
    private String detectedMedicalConditions;
    private Long queueItemId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
