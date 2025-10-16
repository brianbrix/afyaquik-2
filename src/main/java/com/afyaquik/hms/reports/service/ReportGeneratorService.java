package com.afyaquik.hms.reports.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.analytics.domain.AnalyticsMetrics;
import com.afyaquik.hms.analytics.service.AnalyticsService;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.reports.domain.ReportRequest;
import com.afyaquik.hms.reports.domain.ReportResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for generating comprehensive reports using analytics data.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportGeneratorService {

    private final AnalyticsService analyticsService;

    /**
     * Generate comprehensive system report using analytics data.
     */
    public ReportResponse generateComprehensiveReport(ReportRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Generating comprehensive report for tenant: {}", tenantId);

        try {
            // Get analytics data
            AnalyticsMetrics analytics = analyticsService.getSystemAnalytics();
            
            if (analytics == null) {
                log.warn("Analytics data is null for tenant: {}", tenantId);
                return createErrorReport("Analytics data not available");
            }
            
            // Build report sections
            List<ReportResponse.ReportSection> sections = new ArrayList<>();
            
            // System Overview Section
            sections.add(buildSystemOverviewSection(analytics));
            
            // Financial Section
            sections.add(buildFinancialSection(analytics));
            
            // Patient Analytics Section
            sections.add(buildPatientAnalyticsSection(analytics));
            
            // Operational Section
            sections.add(buildOperationalSection(analytics));
            
            // Performance Section
            sections.add(buildPerformanceSection(analytics));
            
            // User Analytics Section
            sections.add(buildUserAnalyticsSection(analytics));
            
            // Department Analytics Section
            sections.add(buildDepartmentAnalyticsSection(analytics));

            // Build summary with null safety
            ReportResponse.ReportSummary summary = ReportResponse.ReportSummary.builder()
                .totalRecords(analytics.getSystemOverview() != null ? analytics.getSystemOverview().getTotalPatients() : 0)
                .totalAmount(analytics.getSystemOverview() != null ? analytics.getSystemOverview().getTotalRevenue() : java.math.BigDecimal.ZERO)
                .totalPatients(analytics.getSystemOverview() != null ? analytics.getSystemOverview().getTotalPatients() : 0)
                .totalUsers(analytics.getSystemOverview() != null ? analytics.getSystemOverview().getTotalUsers() : 0)
                .totalBills(analytics.getSystemOverview() != null ? analytics.getSystemOverview().getTotalBills() : 0)
                .dateRange(formatDateRange(request.getStartDate(), request.getEndDate()))
                .generatedAt(LocalDateTime.now())
                .generatedBy("System")
                .build();

            return ReportResponse.builder()
                .reportId(UUID.randomUUID().toString())
                .reportType("COMPREHENSIVE")
                .title("Comprehensive System Report")
                .generatedAt(LocalDateTime.now())
                .generatedBy("System")
                .status("COMPLETED")
                .fileFormat(request.getFormat() != null ? request.getFormat() : "JSON")
                .summary(summary)
                .sections(sections)
                .build();
                
        } catch (Exception e) {
            log.error("Error generating comprehensive report for tenant: {}", tenantId, e);
            return createErrorReport("Error generating report: " + e.getMessage());
        }
    }

    private ReportResponse.ReportSection buildSystemOverviewSection(AnalyticsMetrics analytics) {
        List<ReportResponse.ReportData> data = new ArrayList<>();
        
        if (analytics.getSystemOverview() != null) {
            data.add(ReportResponse.ReportData.builder()
                .label("Total Users")
                .value(analytics.getSystemOverview().getTotalUsers())
                .category("System")
                .build());
            
            data.add(ReportResponse.ReportData.builder()
                .label("Active Users")
                .value(analytics.getSystemOverview().getActiveUsers())
                .category("System")
                .build());
            
            data.add(ReportResponse.ReportData.builder()
                .label("Total Patients")
                .value(analytics.getSystemOverview().getTotalPatients())
                .category("System")
                .build());
            
            data.add(ReportResponse.ReportData.builder()
                .label("System Uptime")
                .value(analytics.getSystemOverview().getSystemUptime())
                .category("System")
                .build());
        } else {
            data.add(ReportResponse.ReportData.builder()
                .label("System Overview")
                .value("Data not available")
                .category("System")
                .build());
        }

        return ReportResponse.ReportSection.builder()
            .sectionTitle("System Overview")
            .sectionType("SYSTEM")
            .data(data)
            .description("High-level system metrics and statistics")
            .build();
    }

    private ReportResponse.ReportSection buildFinancialSection(AnalyticsMetrics analytics) {
        List<ReportResponse.ReportData> data = new ArrayList<>();
        
        if (analytics.getFinancialAnalytics() != null) {
            data.add(ReportResponse.ReportData.builder()
                .label("Total Revenue")
                .value(analytics.getFinancialAnalytics().getTotalRevenue())
                .category("Financial")
                .build());
            
            data.add(ReportResponse.ReportData.builder()
                .label("Revenue Today")
                .value(analytics.getFinancialAnalytics().getRevenueToday())
                .category("Financial")
                .build());
            
            data.add(ReportResponse.ReportData.builder()
                .label("Total Bills")
                .value(analytics.getFinancialAnalytics().getTotalBills())
                .category("Financial")
                .build());
            
            data.add(ReportResponse.ReportData.builder()
                .label("Paid Bills")
                .value(analytics.getFinancialAnalytics().getPaidBills())
                .category("Financial")
                .build());
        } else {
            data.add(ReportResponse.ReportData.builder()
                .label("Financial Data")
                .value("Data not available")
                .category("Financial")
                .build());
        }

        return ReportResponse.ReportSection.builder()
            .sectionTitle("Financial Analytics")
            .sectionType("FINANCIAL")
            .data(data)
            .description("Financial performance and revenue metrics")
            .build();
    }

    private ReportResponse.ReportSection buildPatientAnalyticsSection(AnalyticsMetrics analytics) {
        List<ReportResponse.ReportData> data = new ArrayList<>();
        
        if (analytics.getPatientAnalytics() != null) {
            data.add(ReportResponse.ReportData.builder()
                .label("New Patients Today")
                .value(analytics.getPatientAnalytics().getNewPatientsToday())
                .category("Patient")
                .build());
            
            data.add(ReportResponse.ReportData.builder()
                .label("Total Patients")
                .value(analytics.getPatientAnalytics().getTotalPatients())
                .category("Patient")
                .build());
            
            data.add(ReportResponse.ReportData.builder()
                .label("Average Visits Per Patient")
                .value(analytics.getPatientAnalytics().getAverageVisitsPerPatient())
                .category("Patient")
                .build());
        }

        return ReportResponse.ReportSection.builder()
            .sectionTitle("Patient Analytics")
            .sectionType("PATIENT")
            .data(data)
            .description("Patient demographics and visit statistics")
            .build();
    }

    private ReportResponse.ReportSection buildOperationalSection(AnalyticsMetrics analytics) {
        List<ReportResponse.ReportData> data = new ArrayList<>();
        
        if (analytics.getQueueAnalytics() != null) {
            data.add(ReportResponse.ReportData.builder()
                .label("Total Queue Items")
                .value(analytics.getQueueAnalytics().getTotalQueueItems())
                .category("Operational")
                .build());
            
            data.add(ReportResponse.ReportData.builder()
                .label("Pending Items")
                .value(analytics.getQueueAnalytics().getPendingItems())
                .category("Operational")
                .build());
            
            data.add(ReportResponse.ReportData.builder()
                .label("Completed Items")
                .value(analytics.getQueueAnalytics().getCompletedItems())
                .category("Operational")
                .build());
            
            data.add(ReportResponse.ReportData.builder()
                .label("Average Wait Time")
                .value(analytics.getQueueAnalytics().getAverageWaitTime())
                .category("Operational")
                .build());
            
            data.add(ReportResponse.ReportData.builder()
                .label("Average Processing Time")
                .value(analytics.getQueueAnalytics().getAverageProcessingTime())
                .category("Operational")
                .build());
        }

        return ReportResponse.ReportSection.builder()
            .sectionTitle("Operational Analytics")
            .sectionType("OPERATIONAL")
            .data(data)
            .description("Queue management and operational efficiency metrics")
            .build();
    }

    private ReportResponse.ReportSection buildPerformanceSection(AnalyticsMetrics analytics) {
        List<ReportResponse.ReportData> data = new ArrayList<>();
        
        if (analytics.getPerformanceMetrics() != null) {
            data.add(ReportResponse.ReportData.builder()
                .label("Average Response Time")
                .value(analytics.getPerformanceMetrics().getAverageResponseTime())
                .category("Performance")
                .build());
            
            data.add(ReportResponse.ReportData.builder()
                .label("System Availability")
                .value(analytics.getPerformanceMetrics().getSystemAvailability())
                .category("Performance")
                .build());
            
            data.add(ReportResponse.ReportData.builder()
                .label("Total Errors")
                .value(analytics.getPerformanceMetrics().getTotalErrors())
                .category("Performance")
                .build());
        }

        return ReportResponse.ReportSection.builder()
            .sectionTitle("Performance Metrics")
            .sectionType("PERFORMANCE")
            .data(data)
            .description("System performance and reliability metrics")
            .build();
    }

    private ReportResponse.ReportSection buildUserAnalyticsSection(AnalyticsMetrics analytics) {
        List<ReportResponse.ReportData> data = new ArrayList<>();
        
        if (analytics.getUserAnalytics() != null) {
            data.add(ReportResponse.ReportData.builder()
                .label("Total Users")
                .value(analytics.getUserAnalytics().getTotalUsers())
                .category("User")
                .build());
            
            data.add(ReportResponse.ReportData.builder()
                .label("Active Users")
                .value(analytics.getUserAnalytics().getActiveUsers())
                .category("User")
                .build());
            
            data.add(ReportResponse.ReportData.builder()
                .label("New Users Today")
                .value(analytics.getUserAnalytics().getNewUsersToday())
                .category("User")
                .build());
            
            data.add(ReportResponse.ReportData.builder()
                .label("New Users This Week")
                .value(analytics.getUserAnalytics().getNewUsersThisWeek())
                .category("User")
                .build());
        }

        return ReportResponse.ReportSection.builder()
            .sectionTitle("User Analytics")
            .sectionType("USER")
            .data(data)
            .description("User activity and engagement metrics")
            .build();
    }

    private ReportResponse.ReportSection buildDepartmentAnalyticsSection(AnalyticsMetrics analytics) {
        List<ReportResponse.ReportData> data = new ArrayList<>();
        
        if (analytics.getDepartmentAnalytics() != null && analytics.getDepartmentAnalytics().getDepartmentStats() != null) {
            // Add department statistics
            analytics.getDepartmentAnalytics().getDepartmentStats().forEach((deptName, stats) -> {
                data.add(ReportResponse.ReportData.builder()
                    .label(deptName + " - Total Patients")
                    .value(stats.getTotalPatients())
                    .category("Department")
                    .build());
            });
        }

        return ReportResponse.ReportSection.builder()
            .sectionTitle("Department Analytics")
            .sectionType("DEPARTMENT")
            .data(data)
            .description("Department-wise performance and statistics")
            .build();
    }

    private ReportResponse createErrorReport(String errorMessage) {
        ReportResponse.ReportSummary summary = ReportResponse.ReportSummary.builder()
            .totalRecords(0)
            .totalAmount(java.math.BigDecimal.ZERO)
            .totalPatients(0)
            .totalUsers(0)
            .totalBills(0)
            .dateRange("Error")
            .generatedAt(LocalDateTime.now())
            .generatedBy("System")
            .build();

        ReportResponse.ReportSection errorSection = ReportResponse.ReportSection.builder()
            .sectionTitle("Error")
            .sectionType("ERROR")
            .data(List.of(ReportResponse.ReportData.builder()
                .label("Error Message")
                .value(errorMessage)
                .category("Error")
                .build()))
            .description("An error occurred while generating the report")
            .build();

        return ReportResponse.builder()
            .reportId(UUID.randomUUID().toString())
            .reportType("ERROR")
            .title("Report Generation Error")
            .generatedAt(LocalDateTime.now())
            .generatedBy("System")
            .status("FAILED")
            .fileFormat("JSON")
            .summary(summary)
            .sections(List.of(errorSection))
            .build();
    }

    private String formatDateRange(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        if (startDate == null && endDate == null) {
            return "All Time";
        }
        if (startDate == null) {
            return "Up to " + endDate.toString();
        }
        if (endDate == null) {
            return "From " + startDate.toString();
        }
        return startDate.toString() + " to " + endDate.toString();
    }
}
