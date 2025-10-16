package com.afyaquik.hms.reports.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.reports.domain.FinancialReport;
import com.afyaquik.hms.reports.domain.OperationalReport;
import com.afyaquik.hms.reports.domain.PatientReport;
import com.afyaquik.hms.reports.domain.ReportRequest;
import com.afyaquik.hms.reports.domain.ReportResponse;
import com.afyaquik.hms.reports.repository.ReportRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for generating comprehensive reports.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReportService {

    private final ReportRepository reportRepository;
    private final ReportGeneratorService reportGeneratorService;

    /**
     * Generate patient report.
     */
    public ReportResponse generatePatientReport(ReportRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Generating patient report for tenant: {}", tenantId);

        List<PatientReport> patientData = reportRepository.getPatientReportData(
            tenantId, request.getStartDate(), request.getEndDate());

        ReportResponse.ReportSummary summary = ReportResponse.ReportSummary.builder()
            .totalRecords(patientData.size())
            .totalPatients((long) patientData.size())
            .dateRange(formatDateRange(request.getStartDate(), request.getEndDate()))
            .generatedAt(LocalDateTime.now())
            .build();

        ReportResponse.ReportSection section = ReportResponse.ReportSection.builder()
            .sectionTitle("Patient Report")
            .sectionType("TABLE")
            .data(patientData.stream()
                .map(this::convertToReportData)
                .collect(Collectors.toList()))
            .description("Comprehensive patient information report")
            .build();

        return ReportResponse.builder()
            .reportId(UUID.randomUUID().toString())
            .reportType("PATIENT")
            .title("Patient Report")
            .generatedAt(LocalDateTime.now())
            .status("COMPLETED")
            .fileFormat(request.getFormat())
            .summary(summary)
            .sections(List.of(section))
            .build();
    }

    /**
     * Generate financial report.
     */
    public ReportResponse generateFinancialReport(ReportRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Generating financial report for tenant: {}", tenantId);

        // Get financial data
        Double totalRevenue = reportRepository.getTotalRevenue(tenantId, request.getStartDate(), request.getEndDate());
        Long totalBills = reportRepository.getTotalBills(tenantId, request.getStartDate(), request.getEndDate());
        Double paidAmount = reportRepository.getPaidAmount(tenantId, request.getStartDate(), request.getEndDate());
        Double pendingAmount = reportRepository.getPendingAmount(tenantId, request.getStartDate(), request.getEndDate());

        FinancialReport.FinancialSummary summary = FinancialReport.FinancialSummary.builder()
            .totalRevenue(BigDecimal.valueOf(totalRevenue != null ? totalRevenue : 0))
            .totalBills(BigDecimal.valueOf(totalBills != null ? totalBills : 0))
            .paidAmount(BigDecimal.valueOf(paidAmount != null ? paidAmount : 0))
            .pendingAmount(BigDecimal.valueOf(pendingAmount != null ? pendingAmount : 0))
            .build();

        // Get department revenue
        List<Object[]> deptRevenue = reportRepository.getRevenueByDepartment(
            tenantId, request.getStartDate(), request.getEndDate());
        
        List<FinancialReport.RevenueByDepartment> revenueByDept = deptRevenue.stream()
            .map(row -> FinancialReport.RevenueByDepartment.builder()
                .department((String) row[0])
                .revenue((BigDecimal) row[1])
                .billCount(((Number) row[2]).longValue())
                .build())
            .collect(Collectors.toList());

        // Get daily revenue
        List<Object[]> dailyRevenueData = reportRepository.getDailyRevenue(
            tenantId, request.getStartDate(), request.getEndDate());
        
        List<FinancialReport.DailyRevenue> dailyRevenue = dailyRevenueData.stream()
            .map(row -> FinancialReport.DailyRevenue.builder()
                .date(((java.sql.Date) row[0]).toLocalDate())
                .revenue((BigDecimal) row[1])
                .billCount(((Number) row[2]).longValue())
                .build())
            .collect(Collectors.toList());

        // Get bill status summary
        List<Object[]> billStatusData = reportRepository.getBillStatusSummary(
            tenantId, request.getStartDate(), request.getEndDate());
        
        List<FinancialReport.BillStatusSummary> billStatuses = billStatusData.stream()
            .map(row -> FinancialReport.BillStatusSummary.builder()
                .status((String) row[0])
                .count(((Number) row[1]).longValue())
                .amount((BigDecimal) row[2])
                .build())
            .collect(Collectors.toList());

        FinancialReport financialReport = FinancialReport.builder()
            .reportPeriod(formatDateRange(request.getStartDate(), request.getEndDate()))
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .summary(summary)
            .revenueByDepartment(revenueByDept)
            .dailyRevenue(dailyRevenue)
            .billStatuses(billStatuses)
            .build();

        ReportResponse.ReportSummary reportSummary = ReportResponse.ReportSummary.builder()
            .totalRecords(totalBills != null ? totalBills : 0)
            .totalAmount(BigDecimal.valueOf(totalRevenue != null ? totalRevenue : 0))
            .dateRange(formatDateRange(request.getStartDate(), request.getEndDate()))
            .generatedAt(LocalDateTime.now())
            .build();

        ReportResponse.ReportSection section = ReportResponse.ReportSection.builder()
            .sectionTitle("Financial Report")
            .sectionType("FINANCIAL")
            .data(convertFinancialToReportData(financialReport))
            .description("Comprehensive financial analysis report")
            .build();

        return ReportResponse.builder()
            .reportId(UUID.randomUUID().toString())
            .reportType("FINANCIAL")
            .title("Financial Report")
            .generatedAt(LocalDateTime.now())
            .status("COMPLETED")
            .fileFormat(request.getFormat())
            .summary(reportSummary)
            .sections(List.of(section))
            .build();
    }

    /**
     * Generate operational report.
     */
    public ReportResponse generateOperationalReport(ReportRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Generating operational report for tenant: {}", tenantId);

        // Get operational data
        Long totalPatients = reportRepository.getTotalPatients(tenantId, request.getStartDate(), request.getEndDate());
        Long totalQueueItems = reportRepository.getTotalQueueItems(tenantId, request.getStartDate(), request.getEndDate());
        Long activeUsers = reportRepository.getActiveUsers(tenantId);

        OperationalReport.OperationalSummary summary = OperationalReport.OperationalSummary.builder()
            .totalPatients(totalPatients != null ? totalPatients : 0)
            .totalQueueItems(totalQueueItems != null ? totalQueueItems : 0)
            .totalUsers(activeUsers != null ? activeUsers : 0)
            .activeUsers(activeUsers != null ? activeUsers : 0)
            .build();

        // Get user activity
        List<Object[]> userActivityData = reportRepository.getUserActivity(
            tenantId, request.getStartDate(), request.getEndDate());
        
        List<OperationalReport.UserActivity> userActivity = userActivityData.stream()
            .map(row -> OperationalReport.UserActivity.builder()
                .username((String) row[0])
                .fullName((String) row[1])
                .department((String) row[2])
                .role((String) row[3])
                .totalActions(((Number) row[4]).longValue())
                .lastLogin(((java.sql.Timestamp) row[5]).toLocalDateTime())
                .lastActivity(((java.sql.Timestamp) row[6]).toLocalDateTime())
                .build())
            .collect(Collectors.toList());

        OperationalReport operationalReport = OperationalReport.builder()
            .reportPeriod(formatDateRange(request.getStartDate(), request.getEndDate()))
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .summary(summary)
            .userActivity(userActivity)
            .build();

        ReportResponse.ReportSummary reportSummary = ReportResponse.ReportSummary.builder()
            .totalRecords(totalPatients != null ? totalPatients : 0)
            .totalUsers(activeUsers != null ? activeUsers : 0)
            .dateRange(formatDateRange(request.getStartDate(), request.getEndDate()))
            .generatedAt(LocalDateTime.now())
            .build();

        ReportResponse.ReportSection section = ReportResponse.ReportSection.builder()
            .sectionTitle("Operational Report")
            .sectionType("OPERATIONAL")
            .data(convertOperationalToReportData(operationalReport))
            .description("Comprehensive operational analysis report")
            .build();

        return ReportResponse.builder()
            .reportId(UUID.randomUUID().toString())
            .reportType("OPERATIONAL")
            .title("Operational Report")
            .generatedAt(LocalDateTime.now())
            .status("COMPLETED")
            .fileFormat(request.getFormat())
            .summary(reportSummary)
            .sections(List.of(section))
            .build();
    }

    /**
     * Generate comprehensive system report.
     */
    public ReportResponse generateSystemReport(ReportRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Generating system report for tenant: {}", tenantId);

        // Use the comprehensive report generator
        return reportGeneratorService.generateComprehensiveReport(request);
    }

    // Helper methods
    private String formatDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null && endDate == null) {
            return "All Time";
        }
        if (startDate == null) {
            return "Up to " + endDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        }
        if (endDate == null) {
            return "From " + startDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        }
        return startDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + " to " + 
               endDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    }

    private ReportResponse.ReportData convertToReportData(PatientReport patient) {
        return ReportResponse.ReportData.builder()
            .label(patient.getPatientName())
            .value(patient.getMedicalRecordNumber())
            .category("Patient")
            .attributes(java.util.Map.of(
                "phone", patient.getPhone(),
                "email", patient.getEmail(),
                "gender", patient.getGender(),
                "totalVisits", patient.getTotalVisits()
            ))
            .build();
    }

    private List<ReportResponse.ReportData> convertFinancialToReportData(FinancialReport financial) {
        List<ReportResponse.ReportData> data = new ArrayList<>();
        
        data.add(ReportResponse.ReportData.builder()
            .label("Total Revenue")
            .value(financial.getSummary().getTotalRevenue())
            .category("Financial")
            .build());
        
        data.add(ReportResponse.ReportData.builder()
            .label("Total Bills")
            .value(financial.getSummary().getTotalBills())
            .category("Financial")
            .build());
        
        return data;
    }

    private List<ReportResponse.ReportData> convertOperationalToReportData(OperationalReport operational) {
        List<ReportResponse.ReportData> data = new ArrayList<>();
        
        data.add(ReportResponse.ReportData.builder()
            .label("Total Patients")
            .value(operational.getSummary().getTotalPatients())
            .category("Operational")
            .build());
        
        data.add(ReportResponse.ReportData.builder()
            .label("Total Users")
            .value(operational.getSummary().getTotalUsers())
            .category("Operational")
            .build());
        
        return data;
    }

    /**
     * Generate billing report for current user.
     */
    public ReportResponse generateBillingReport(ReportRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        String currentUser = getCurrentUser();
        log.info("Generating billing report for user: {} in tenant: {} with request: {}", currentUser, tenantId, request);

        // Get billing data for current user
        List<Object[]> userBills = reportRepository.getUserBills(tenantId, currentUser, request.getStartDate(), request.getEndDate());
        Double userRevenue = reportRepository.getUserRevenue(tenantId, currentUser, request.getStartDate(), request.getEndDate());
        Long userBillCount = reportRepository.getUserBillCount(tenantId, currentUser, request.getStartDate(), request.getEndDate());

        // Convert to report data
        List<ReportResponse.ReportData> billData = userBills.stream()
            .map(row -> ReportResponse.ReportData.builder()
                .label("Bill #" + row[0])
                .value(((Number) row[1]).doubleValue())
                .category("Billing")
                .attributes(java.util.Map.of(
                    "patient", row[2],
                    "status", row[3]
                ))
                .build())
            .collect(Collectors.toList());

        ReportResponse.ReportSummary summary = ReportResponse.ReportSummary.builder()
            .totalRecords(userBillCount != null ? userBillCount : 0)
            .totalAmount(BigDecimal.valueOf(userRevenue != null ? userRevenue : 0))
            .dateRange(formatDateRange(request.getStartDate(), request.getEndDate()))
            .generatedAt(LocalDateTime.now())
            .build();

        ReportResponse.ReportSection section = ReportResponse.ReportSection.builder()
            .sectionTitle("Billing Report - " + currentUser)
            .sectionType("BILLING")
            .data(billData)
            .description("Billing report for current user")
            .build();

        return ReportResponse.builder()
            .reportId(UUID.randomUUID().toString())
            .reportType("BILLING")
            .title("Billing Report - " + currentUser)
            .generatedAt(LocalDateTime.now())
            .status("COMPLETED")
            .fileFormat(request.getFormat())
            .summary(summary)
            .sections(List.of(section))
            .build();
    }

    /**
     * Generate queue report for current user.
     */
    public ReportResponse generateQueueReport(ReportRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        String currentUser = getCurrentUser();
        log.info("Generating queue report for user: {} in tenant: {} with request: {}", currentUser, tenantId, request);

        // Get queue data for current user
        List<Object[]> userQueueItems = reportRepository.getUserQueueItems(tenantId, currentUser, request.getStartDate(), request.getEndDate());
        Long userQueueCount = reportRepository.getUserQueueCount(tenantId, currentUser, request.getStartDate(), request.getEndDate());

        // Convert to report data
        List<ReportResponse.ReportData> queueData = userQueueItems.stream()
            .map(row -> ReportResponse.ReportData.builder()
                .label("Queue Item #" + row[0])
                .value(((Number) row[1]).doubleValue())
                .category("Queue")
                .attributes(java.util.Map.of(
                    "patient", row[2],
                    "status", row[3],
                    "department", row[4]
                ))
                .build())
            .collect(Collectors.toList());

        ReportResponse.ReportSummary summary = ReportResponse.ReportSummary.builder()
            .totalRecords(userQueueCount != null ? userQueueCount : 0)
            .dateRange(formatDateRange(request.getStartDate(), request.getEndDate()))
            .generatedAt(LocalDateTime.now())
            .build();

        ReportResponse.ReportSection section = ReportResponse.ReportSection.builder()
            .sectionTitle("Queue Report - " + currentUser)
            .sectionType("QUEUE")
            .data(queueData)
            .description("Queue report for current user")
            .build();

        return ReportResponse.builder()
            .reportId(UUID.randomUUID().toString())
            .reportType("QUEUE")
            .title("Queue Report - " + currentUser)
            .generatedAt(LocalDateTime.now())
            .status("COMPLETED")
            .fileFormat(request.getFormat())
            .summary(summary)
            .sections(List.of(section))
            .build();
    }

    /**
     * Generate user activity report for current user.
     */
    public ReportResponse generateUserActivityReport(ReportRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        String currentUser = getCurrentUser();
        log.info("Generating user activity report for user: {} in tenant: {} with request: {}", currentUser, tenantId, request);

        // Get user activity data
        List<Object[]> userActivity = reportRepository.getUserActivityForUser(tenantId, currentUser, request.getStartDate(), request.getEndDate());
        Long totalActions = reportRepository.getUserTotalActions(tenantId, currentUser, request.getStartDate(), request.getEndDate());

        // Convert to report data
        List<ReportResponse.ReportData> activityData = userActivity.stream()
            .map(row -> ReportResponse.ReportData.builder()
                .label("Action: " + row[0])
                .value(((Number) row[1]).doubleValue())
                .category("Activity")
                .attributes(java.util.Map.of(
                    "timestamp", row[2],
                    "details", row[3]
                ))
                .build())
            .collect(Collectors.toList());

        ReportResponse.ReportSummary summary = ReportResponse.ReportSummary.builder()
            .totalRecords(totalActions != null ? totalActions : 0)
            .dateRange(formatDateRange(request.getStartDate(), request.getEndDate()))
            .generatedAt(LocalDateTime.now())
            .build();

        ReportResponse.ReportSection section = ReportResponse.ReportSection.builder()
            .sectionTitle("User Activity Report - " + currentUser)
            .sectionType("USER_ACTIVITY")
            .data(activityData)
            .description("User activity report for current user")
            .build();

        return ReportResponse.builder()
            .reportId(UUID.randomUUID().toString())
            .reportType("USER_ACTIVITY")
            .title("User Activity Report - " + currentUser)
            .generatedAt(LocalDateTime.now())
            .status("COMPLETED")
            .fileFormat(request.getFormat())
            .summary(summary)
            .sections(List.of(section))
            .build();
    }

    /**
     * Get the current authenticated user's username.
     */
    private String getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !"anonymousUser".equals(authentication.getName())) {
                return authentication.getName();
            }
        } catch (Exception e) {
            log.warn("Could not get current user: {}", e.getMessage());
        }
        return "system";
    }
}
