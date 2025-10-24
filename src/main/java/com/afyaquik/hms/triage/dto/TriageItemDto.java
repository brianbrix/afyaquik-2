package com.afyaquik.hms.triage.dto;

import com.afyaquik.hms.triage.domain.TriageItem;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TriageItemDto {
    private Long id;
    private String name;
    private String description;
    private String category;
    private TriageItem.TriageDataType dataType;
    private String unit;
    private String inputConfig;
    private Double normalRangeMin;
    private Double normalRangeMax;
    private Double warningThresholdMin;
    private Double warningThresholdMax;
    private Double criticalThresholdMin;
    private Double criticalThresholdMax;
    private String calculationFormula;
    private String variableMappings;
    private Integer displayOrder;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}