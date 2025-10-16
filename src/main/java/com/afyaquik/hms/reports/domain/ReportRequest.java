package com.afyaquik.hms.reports.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request object for generating reports.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {
    
    private String reportType;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<String> departments;
    private List<String> users;
    private String format; // PDF, EXCEL, CSV
    private boolean includeCharts;
    private String timezone;
    private ReportFilters filters;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportFilters {
        private String patientStatus;
        private String billStatus;
        private String queueStatus;
        private String userRole;
        private String department;
        private BigDecimal minAmount;
        private BigDecimal maxAmount;
        private String gender;
        private Integer minAge;
        private Integer maxAge;
    }
}
