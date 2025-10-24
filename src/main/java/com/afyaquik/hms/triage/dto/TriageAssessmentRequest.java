package com.afyaquik.hms.triage.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class TriageAssessmentRequest {
    private Long patientId;
    private Long triageItemId;
    private Long staffId;
    private Double numericValue;
    private String textValue;
    private Boolean booleanValue;
    private String selectValue;
    private String assessmentNotes;
    private String staffNotes;
    private LocalDateTime triageTimestamp;
    private Long queueItemId;
}
