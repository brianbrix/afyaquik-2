package com.afyaquik.hms.triage.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "triage_items")
@Data
@EqualsAndHashCode(callSuper = true)
public class TriageItem extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", nullable = false)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_type", nullable = false)
    private TriageDataType dataType;

    @Column(name = "unit")
    private String unit;

    @Column(name = "input_config", columnDefinition = "TEXT")
    private String inputConfig;

    @Column(name = "normal_range_min")
    private Double normalRangeMin;

    @Column(name = "normal_range_max")
    private Double normalRangeMax;

    @Column(name = "warning_threshold_min")
    private Double warningThresholdMin;

    @Column(name = "warning_threshold_max")
    private Double warningThresholdMax;

    @Column(name = "critical_threshold_min")
    private Double criticalThresholdMin;

    @Column(name = "critical_threshold_max")
    private Double criticalThresholdMax;

    @Column(name = "calculation_formula", columnDefinition = "TEXT")
    private String calculationFormula;

    @Column(name = "variable_mappings", columnDefinition = "TEXT")
    private String variableMappings;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "active")
    private Boolean active = true;

    public enum TriageDataType {
        NUMERIC, TEXT, BOOLEAN, SELECT
    }
}