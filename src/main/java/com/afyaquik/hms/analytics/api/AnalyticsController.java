package com.afyaquik.hms.analytics.api;

import com.afyaquik.hms.analytics.domain.AnalyticsMetrics;
import com.afyaquik.hms.analytics.service.AnalyticsService;
import com.afyaquik.hms.common.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * REST Controller for analytics and reporting endpoints.
 */
@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Slf4j
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * Get comprehensive system analytics.
     */
    @GetMapping
    @PreAuthorize("hasPermission(null,'VIEW_ANALYTICS')")
    public ResponseEntity<ApiResponse<AnalyticsMetrics>> getSystemAnalytics() {
        try {
            log.info("Fetching system analytics");
            AnalyticsMetrics metrics = analyticsService.getSystemAnalytics();
            return ResponseEntity.ok(ApiResponse.success(metrics, 200,"Analytics retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching system analytics", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch analytics: " + e.getMessage()));
        }
    }

    /**
     * Get analytics for a specific date range.
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasPermission(null,'VIEW_ANALYTICS')")
    public ResponseEntity<ApiResponse<AnalyticsMetrics>> getAnalyticsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            log.info("Fetching analytics for date range: {} to {}", startDate, endDate);
            AnalyticsMetrics metrics = analyticsService.getAnalyticsByDateRange(startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success(metrics, 200,"Analytics retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching analytics for date range", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch analytics: " + e.getMessage()));
        }
    }

    /**
     * Get real-time dashboard metrics.
     */
    @GetMapping("/realtime")
    @PreAuthorize("hasPermission(null,'VIEW_ANALYTICS')")
    public ResponseEntity<ApiResponse<AnalyticsMetrics.SystemOverview>> getRealTimeMetrics() {
        try {
            log.info("Fetching real-time metrics");
            AnalyticsMetrics.SystemOverview metrics = analyticsService.getRealTimeMetrics();
            return ResponseEntity.ok(ApiResponse.success(metrics, 200,"Real-time metrics retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching real-time metrics", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch real-time metrics: " + e.getMessage()));
        }
    }

    /**
     * Get system overview metrics.
     */
    @GetMapping("/overview")
    @PreAuthorize("hasPermission(null,'VIEW_ANALYTICS')")
    public ResponseEntity<ApiResponse<AnalyticsMetrics.SystemOverview>> getSystemOverview() {
        try {
            log.info("Fetching system overview");
            AnalyticsMetrics.SystemOverview overview = analyticsService.getSystemAnalytics().getSystemOverview();
            return ResponseEntity.ok(ApiResponse.success(overview, 200,"System overview retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching system overview", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch system overview: " + e.getMessage()));
        }
    }

    /**
     * Get user analytics.
     */
    @GetMapping("/users")
    @PreAuthorize("hasPermission(null,'VIEW_ANALYTICS')")
    public ResponseEntity<ApiResponse<AnalyticsMetrics.UserAnalytics>> getUserAnalytics() {
        try {
            log.info("Fetching user analytics");
            AnalyticsMetrics.UserAnalytics analytics = analyticsService.getSystemAnalytics().getUserAnalytics();
            return ResponseEntity.ok(ApiResponse.success(analytics, 200,"User analytics retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching user analytics", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch user analytics: " + e.getMessage()));
        }
    }

    /**
     * Get patient analytics.
     */
    @GetMapping("/patients")
    @PreAuthorize("hasPermission(null,'VIEW_ANALYTICS')")
    public ResponseEntity<ApiResponse<AnalyticsMetrics.PatientAnalytics>> getPatientAnalytics() {
        try {
            log.info("Fetching patient analytics");
            AnalyticsMetrics.PatientAnalytics analytics = analyticsService.getSystemAnalytics().getPatientAnalytics();
            return ResponseEntity.ok(ApiResponse.success(analytics, 200,"Patient analytics retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching patient analytics", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch patient analytics: " + e.getMessage()));
        }
    }

    /**
     * Get queue analytics.
     */
    @GetMapping("/queue")
    @PreAuthorize("hasPermission(null,'VIEW_ANALYTICS')")
    public ResponseEntity<ApiResponse<AnalyticsMetrics.QueueAnalytics>> getQueueAnalytics() {
        try {
            log.info("Fetching queue analytics");
            AnalyticsMetrics.QueueAnalytics analytics = analyticsService.getSystemAnalytics().getQueueAnalytics();
            return ResponseEntity.ok(ApiResponse.success(analytics, 200,"Queue analytics retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching queue analytics", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch queue analytics: " + e.getMessage()));
        }
    }

    /**
     * Get financial analytics.
     */
    @GetMapping("/financial")
    @PreAuthorize("hasPermission(null,'VIEW_ANALYTICS')")
    public ResponseEntity<ApiResponse<AnalyticsMetrics.FinancialAnalytics>> getFinancialAnalytics() {
        try {
            log.info("Fetching financial analytics");
            AnalyticsMetrics.FinancialAnalytics analytics = analyticsService.getSystemAnalytics().getFinancialAnalytics();
            return ResponseEntity.ok(ApiResponse.success(analytics, 200,"Financial analytics retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching financial analytics", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch financial analytics: " + e.getMessage()));
        }
    }

    /**
     * Get department analytics.
     */
    @GetMapping("/departments")
    @PreAuthorize("hasPermission(null,'VIEW_ANALYTICS')")
    public ResponseEntity<ApiResponse<AnalyticsMetrics.DepartmentAnalytics>> getDepartmentAnalytics() {
        try {
            log.info("Fetching department analytics");
            AnalyticsMetrics.DepartmentAnalytics analytics = analyticsService.getSystemAnalytics().getDepartmentAnalytics();
            return ResponseEntity.ok(ApiResponse.success(analytics, 200,"Department analytics retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching department analytics", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch department analytics: " + e.getMessage()));
        }
    }

    /**
     * Get time-based analytics.
     */
    @GetMapping("/time-based")
    @PreAuthorize("hasPermission(null,'VIEW_ANALYTICS')")
    public ResponseEntity<ApiResponse<AnalyticsMetrics.TimeBasedAnalytics>> getTimeBasedAnalytics() {
        try {
            log.info("Fetching time-based analytics");
            AnalyticsMetrics.TimeBasedAnalytics analytics = analyticsService.getSystemAnalytics().getTimeBasedAnalytics();
            return ResponseEntity.ok(ApiResponse.success(analytics, 200,"Time-based analytics retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching time-based analytics", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch time-based analytics: " + e.getMessage()));
        }
    }

    /**
     * Get performance metrics.
     */
    @GetMapping("/performance")
    @PreAuthorize("hasPermission(null,'VIEW_ANALYTICS')")
    public ResponseEntity<ApiResponse<AnalyticsMetrics.PerformanceMetrics>> getPerformanceMetrics() {
        try {
            log.info("Fetching performance metrics");
            AnalyticsMetrics.PerformanceMetrics metrics = analyticsService.getSystemAnalytics().getPerformanceMetrics();
            return ResponseEntity.ok(ApiResponse.success(metrics, 200,"Performance metrics retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching performance metrics", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch performance metrics: " + e.getMessage()));
        }
    }
}
