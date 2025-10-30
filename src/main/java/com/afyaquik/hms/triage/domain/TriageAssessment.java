package com.afyaquik.hms.triage.domain;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.common.domain.BaseEntity;
import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.queue.domain.VisitQueueItem;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "triage_assessments")
@Data
@EqualsAndHashCode(callSuper = true)
public class TriageAssessment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triage_item_id", nullable = false)
    private TriageItem triageItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private StaffUser staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "queue_item_id")
    private VisitQueueItem queueItem;

    // Numeric value for numeric data types
    @Column(name = "numeric_value")
    private Double numericValue;

    // Text value for text data types
    @Column(name = "text_value", columnDefinition = "TEXT")
    private String textValue;

    // Boolean value for boolean data types
    @Column(name = "boolean_value")
    private Boolean booleanValue;

    // Select value for select data types
    @Column(name = "select_value")
    private String selectValue;

    // Calculated result from formulas
    @Column(name = "calculated_result")
    private String calculatedResult;

    // Assessment flags
    @Column(name = "is_normal")
    private Boolean isNormal;

    @Column(name = "is_abnormal")
    private Boolean isAbnormal;

    @Column(name = "is_warning")
    private Boolean isWarning;

    @Column(name = "is_critical")
    private Boolean isCritical;

    // Notes
    @Column(name = "assessment_notes", columnDefinition = "TEXT")
    private String assessmentNotes;

    @Column(name = "staff_notes", columnDefinition = "TEXT")
    private String staffNotes;

    // Triage timestamp
    @Column(name = "triage_timestamp")
    private java.time.LocalDateTime triageTimestamp;

    // Color-coded notes for medical conditions
    @Column(name = "color_coded_notes", columnDefinition = "TEXT")
    private String colorCodedNotes;

    // Detected medical conditions
    @Column(name = "detected_medical_conditions", columnDefinition = "TEXT")
    private String detectedMedicalConditions;
}

