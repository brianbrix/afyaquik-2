package com.afyaquik.hms.reports.api;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.reports.domain.ReportRequest;
import com.afyaquik.hms.reports.domain.ReportResponse;
import com.afyaquik.hms.reports.service.ReportService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST Controller for report generation endpoints.
 */
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;

    /**
     * Generate patient report.
     */
    @PostMapping("/patient")
    @PreAuthorize("hasRole('ADMIN') or hasPermission(null, 'VIEW_PATIENTS')")
    public ResponseEntity<ApiResponse<ReportResponse>> generatePatientReport(
            @Valid @RequestBody ReportRequest request) {
        try {
            log.info("Generating patient report");
            ReportResponse response = reportService.generatePatientReport(request);
            return ResponseEntity.ok(ApiResponse.success(response, 200, "Patient report generated successfully"));
        } catch (Exception e) {
            log.error("Error generating patient report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate patient report: " + e.getMessage()));
        }
    }

    /**
     * Generate financial report.
     */
    @PostMapping("/financial")
    @PreAuthorize("hasRole('ADMIN') or hasPermission(null, 'VIEW_BILLING')")
    public ResponseEntity<ApiResponse<ReportResponse>> generateFinancialReport(
            @Valid @RequestBody ReportRequest request) {
        try {
            log.info("Generating financial report");
            ReportResponse response = reportService.generateFinancialReport(request);
            return ResponseEntity.ok(ApiResponse.success(response, 200, "Financial report generated successfully"));
        } catch (Exception e) {
            log.error("Error generating financial report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate financial report: " + e.getMessage()));
        }
    }

    /**
     * Generate operational report.
     */
    @PostMapping("/operational")
    @PreAuthorize("hasRole('ADMIN') or hasPermission(null, 'VIEW_OPERATIONS')")
    public ResponseEntity<ApiResponse<ReportResponse>> generateOperationalReport(
            @Valid @RequestBody ReportRequest request) {
        try {
            log.info("Generating operational report");
            ReportResponse response = reportService.generateOperationalReport(request);
            return ResponseEntity.ok(ApiResponse.success(response, 200, "Operational report generated successfully"));
        } catch (Exception e) {
            log.error("Error generating operational report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate operational report: " + e.getMessage()));
        }
    }

    /**
     * Generate comprehensive system report.
     */
    @PostMapping("/system")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReportResponse>> generateSystemReport(
            @Valid @RequestBody ReportRequest request) {
        try {
            log.info("Generating system report");
            ReportResponse response = reportService.generateSystemReport(request);
            return ResponseEntity.ok(ApiResponse.success(response, 200, "System report generated successfully"));
        } catch (Exception e) {
            log.error("Error generating system report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate system report: " + e.getMessage()));
        }
    }

    /**
     * Get available report types.
     */
    @GetMapping("/types")
    @PreAuthorize("hasRole('ADMIN') or hasPermission(null, 'VIEW_REPORTS')")
    public ResponseEntity<ApiResponse<List<String>>> getReportTypes() {
        try {
            List<String> reportTypes = List.of(
                "PATIENT", "FINANCIAL", "OPERATIONAL", "SYSTEM", 
                "BILLING", "QUEUE", "USER_ACTIVITY", "DEPARTMENT"
            );
            return ResponseEntity.ok(ApiResponse.success(reportTypes, 200, "Report types retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving report types", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve report types: " + e.getMessage()));
        }
    }

    /**
     * Get report by date range with filters.
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN') or hasPermission(null, 'VIEW_REPORTS')")
    public ResponseEntity<ApiResponse<ReportResponse>> getReportByDateRange(
            @RequestParam String reportType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String format,
            @RequestParam(required = false) List<String> departments,
            @RequestParam(required = false) List<String> users) {
        try {
            log.info("Generating {} report for date range {} to {}", reportType, startDate, endDate);
            
            ReportRequest request = ReportRequest.builder()
                .reportType(reportType)
                .startDate(startDate)
                .endDate(endDate)
                .format(format != null ? format : "JSON")
                .departments(departments)
                .users(users)
                .build();

            ReportResponse response;
            switch (reportType.toUpperCase()) {
                case "PATIENT":
                    response = reportService.generatePatientReport(request);
                    break;
                case "FINANCIAL":
                    response = reportService.generateFinancialReport(request);
                    break;
                case "OPERATIONAL":
                    response = reportService.generateOperationalReport(request);
                    break;
                case "SYSTEM":
                    response = reportService.generateSystemReport(request);
                    break;
                default:
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Invalid report type: " + reportType));
            }

            return ResponseEntity.ok(ApiResponse.success(response, 200, "Report generated successfully"));
        } catch (Exception e) {
            log.error("Error generating report by date range", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate report: " + e.getMessage()));
        }
    }
    /**
     * Generate billing report.
     */
    @PostMapping("/billing")
    @PreAuthorize("hasRole('ADMIN') or hasPermission(null, 'VIEW_BILLING')")
    public ResponseEntity<ApiResponse<ReportResponse>> generateBillingReport(
            @Valid @RequestBody ReportRequest request) {
        try {
            log.info("Generating billing report with request: {}", request);
            ReportResponse response = reportService.generateBillingReport(request);
            return ResponseEntity.ok(ApiResponse.success(response, 200, "Billing report generated successfully"));
        } catch (Exception e) {
            log.error("Error generating billing report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate billing report: " + e.getMessage()));
        }
    }

    /**
     * Generate queue report for current user.
     */
    @PostMapping("/queue")
    @PreAuthorize("hasRole('ADMIN') or hasPermission(null, 'VIEW_QUEUE')")
    public ResponseEntity<ApiResponse<ReportResponse>> generateQueueReport(
            @Valid @RequestBody ReportRequest request) {
        try {
            log.info("Generating queue report with request: {}", request);
            ReportResponse response = reportService.generateQueueReport(request);
            return ResponseEntity.ok(ApiResponse.success(response, 200, "Queue report generated successfully"));
        } catch (Exception e) {
            log.error("Error generating queue report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate queue report: " + e.getMessage()));
        }
    }

    /**
     * Generate user activity report for current user.
     */
    @PostMapping("/user-activity")
    @PreAuthorize("hasRole('ADMIN') or hasPermission(null, 'VIEW_AUDIT')")
    public ResponseEntity<ApiResponse<ReportResponse>> generateUserActivityReport(
            @Valid @RequestBody ReportRequest request) {
        try {
            log.info("Generating user activity report with request: {}", request);
            ReportResponse response = reportService.generateUserActivityReport(request);
            return ResponseEntity.ok(ApiResponse.success(response, 200, "User activity report generated successfully"));
        } catch (Exception e) {
            log.error("Error generating user activity report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate user activity report: " + e.getMessage()));
        }
    }

    /**
     * Get quick dashboard metrics.
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN') or hasPermission(null, 'VIEW_DASHBOARD')")
    public ResponseEntity<ApiResponse<ReportResponse>> getDashboardMetrics() {
        try {
            log.info("Generating dashboard metrics");
            
            ReportRequest request = ReportRequest.builder()
                .reportType("DASHBOARD")
                .format("JSON")
                .build();

            ReportResponse response = reportService.generateSystemReport(request);
            return ResponseEntity.ok(ApiResponse.success(response, 200, "Dashboard metrics retrieved successfully"));
        } catch (Exception e) {
            log.error("Error generating dashboard metrics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate dashboard metrics: " + e.getMessage()));
        }
    }

    /**
     * Export report in specific format.
     */
    @PostMapping("/export")
    @PreAuthorize("hasRole('ADMIN') or hasPermission(null, 'EXPORT_REPORTS')")
    public ResponseEntity<ApiResponse<ReportResponse>> exportReport(
            @Valid @RequestBody ReportRequest request) {
        try {
            log.info("Exporting report in format: {}", request.getFormat());
            
            ReportResponse response;
            switch (request.getReportType().toUpperCase()) {
                case "PATIENT":
                    response = reportService.generatePatientReport(request);
                    break;
                case "FINANCIAL":
                    response = reportService.generateFinancialReport(request);
                    break;
                case "OPERATIONAL":
                    response = reportService.generateOperationalReport(request);
                    break;
                case "SYSTEM":
                    response = reportService.generateSystemReport(request);
                    break;
                default:
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Invalid report type: " + request.getReportType()));
            }

            // Set download URL based on format
            response.setDownloadUrl("/api/v1/reports/download/" + response.getReportId() + "." + request.getFormat().toLowerCase());
            
            return ResponseEntity.ok(ApiResponse.success(response, 200, "Report exported successfully"));
        } catch (Exception e) {
            log.error("Error exporting report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to export report: " + e.getMessage()));
        }
    }

    /**
     * Download report file.
     */
    @GetMapping("/download/{reportId}")
    @PreAuthorize("hasRole('ADMIN') or hasPermission(null, 'DOWNLOAD_REPORTS')")
    public ResponseEntity<byte[]> downloadReport(@PathVariable String reportId) {
        try {
            log.info("Downloading report: {}", reportId);
            
            // In a real implementation, you would:
            // 1. Retrieve the report from storage
            // 2. Generate the file in the requested format
            // 3. Return the file bytes
            
            // For now, return a placeholder response
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"report_" + reportId + ".pdf\"")
                    .body("Report content would be here".getBytes());
        } catch (Exception e) {
            log.error("Error downloading report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
