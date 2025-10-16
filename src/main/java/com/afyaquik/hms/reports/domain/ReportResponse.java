package com.afyaquik.hms.reports.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response object for report generation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    
    private String reportId;
    private String reportType;
    private String title;
    private LocalDateTime generatedAt;
    private String generatedBy;
    private String status;
    private String downloadUrl;
    private String fileFormat;
    private long fileSize;
    private ReportSummary summary;
    private List<ReportSection> sections;
    private Map<String, Object> metadata;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportSummary {
        private long totalRecords;
        private BigDecimal totalAmount;
        private long totalPatients;
        private long totalBills;
        private long totalUsers;
        private String dateRange;
        private String generatedBy;
        private LocalDateTime generatedAt;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportSection {
        private String sectionTitle;
        private String sectionType;
        private List<ReportData> data;
        private Map<String, Object> charts;
        private String description;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportData {
        private String label;
        private Object value;
        private String category;
        private Map<String, Object> attributes;
    }
}
