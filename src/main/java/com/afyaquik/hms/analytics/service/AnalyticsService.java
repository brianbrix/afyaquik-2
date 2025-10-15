package com.afyaquik.hms.analytics.service;

import com.afyaquik.hms.analytics.domain.AnalyticsMetrics;
import com.afyaquik.hms.analytics.repository.AnalyticsRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Service for generating comprehensive analytics and metrics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;

    /**
     * Get comprehensive analytics metrics for the system.
     */
    public AnalyticsMetrics getSystemAnalytics() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Generating system analytics for tenant: {}", tenantId);

        return AnalyticsMetrics.builder()
                .systemOverview(buildSystemOverview(tenantId))
                .userAnalytics(buildUserAnalytics(tenantId))
                .patientAnalytics(buildPatientAnalytics(tenantId))
                .queueAnalytics(buildQueueAnalytics(tenantId))
                .financialAnalytics(buildFinancialAnalytics(tenantId))
                .departmentAnalytics(buildDepartmentAnalytics(tenantId))
                .timeBasedAnalytics(buildTimeBasedAnalytics(tenantId))
                .performanceMetrics(buildPerformanceMetrics(tenantId))
                .build();
    }

    /**
     * Get analytics for a specific date range.
     */
    public AnalyticsMetrics getAnalyticsByDateRange(LocalDate startDate, LocalDate endDate) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Generating analytics for date range {} to {} for tenant: {}", startDate, endDate, tenantId);

        return AnalyticsMetrics.builder()
                .systemOverview(buildSystemOverviewForDateRange(tenantId, startDate, endDate))
                .userAnalytics(buildUserAnalyticsForDateRange(tenantId, startDate, endDate))
                .patientAnalytics(buildPatientAnalyticsForDateRange(tenantId, startDate, endDate))
                .queueAnalytics(buildQueueAnalyticsForDateRange(tenantId, startDate, endDate))
                .financialAnalytics(buildFinancialAnalyticsForDateRange(tenantId, startDate, endDate))
                .departmentAnalytics(buildDepartmentAnalyticsForDateRange(tenantId, startDate, endDate))
                .timeBasedAnalytics(buildTimeBasedAnalyticsForDateRange(tenantId, startDate, endDate))
                .performanceMetrics(buildPerformanceMetricsForDateRange(tenantId, startDate, endDate))
                .build();
    }

    /**
     * Get real-time dashboard metrics.
     */
    public AnalyticsMetrics.SystemOverview getRealTimeMetrics() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return buildSystemOverview(tenantId);
    }

    private AnalyticsMetrics.SystemOverview buildSystemOverview(String tenantId) {
        return AnalyticsMetrics.SystemOverview.builder()
                .totalUsers(analyticsRepository.getTotalUsers(tenantId))
                .activeUsers(analyticsRepository.getActiveUsers(tenantId))
                .totalPatients(analyticsRepository.getTotalPatients(tenantId))
                .totalQueueItems(analyticsRepository.getTotalQueueItems(tenantId))
                .totalBills(analyticsRepository.getTotalBills(tenantId))
                .totalRevenue(analyticsRepository.getTotalRevenue(tenantId))
                .totalPrescriptions(analyticsRepository.getTotalPrescriptions(tenantId))
                .totalDiagnosticOrders(analyticsRepository.getTotalDiagnosticOrders(tenantId))
                .systemUptime(calculateSystemUptime())
                .systemLoad(calculateSystemLoad())
                .build();
    }

    private AnalyticsMetrics.SystemOverview buildSystemOverviewForDateRange(String tenantId, LocalDate startDate, LocalDate endDate) {
        return AnalyticsMetrics.SystemOverview.builder()
                .totalUsers(analyticsRepository.getTotalUsersForDateRange(tenantId, startDate, endDate))
                .activeUsers(analyticsRepository.getActiveUsersForDateRange(tenantId, startDate, endDate))
                .totalPatients(analyticsRepository.getTotalPatientsForDateRange(tenantId, startDate, endDate))
                .totalQueueItems(analyticsRepository.getTotalQueueItemsForDateRange(tenantId, startDate, endDate))
                .totalBills(analyticsRepository.getTotalBillsForDateRange(tenantId, startDate, endDate))
                .totalRevenue(analyticsRepository.getTotalRevenueForDateRange(tenantId, startDate, endDate))
                .totalPrescriptions(analyticsRepository.getTotalPrescriptionsForDateRange(tenantId, startDate, endDate))
                .totalDiagnosticOrders(analyticsRepository.getTotalDiagnosticOrdersForDateRange(tenantId, startDate, endDate))
                .systemUptime(calculateSystemUptime())
                .systemLoad(calculateSystemLoad())
                .build();
    }

    private AnalyticsMetrics.UserAnalytics buildUserAnalytics(String tenantId) {
        return AnalyticsMetrics.UserAnalytics.builder()
                .totalUsers(analyticsRepository.getTotalUsers(tenantId))
                .activeUsers(analyticsRepository.getActiveUsers(tenantId))
                .inactiveUsers(analyticsRepository.getInactiveUsers(tenantId))
                .newUsersToday(analyticsRepository.getNewUsersToday(tenantId))
                .newUsersThisWeek(analyticsRepository.getNewUsersThisWeek(tenantId))
                .newUsersThisMonth(analyticsRepository.getNewUsersThisMonth(tenantId))
                .usersByRole(analyticsRepository.getUsersByRole(tenantId))
                .usersByDepartment(analyticsRepository.getUsersByDepartment(tenantId))
                .recentUserActivity(analyticsRepository.getRecentUserActivity(tenantId, 10))
                .activeSessions(analyticsRepository.getActiveSessions(tenantId))
                .build();
    }

    private AnalyticsMetrics.UserAnalytics buildUserAnalyticsForDateRange(String tenantId, LocalDate startDate, LocalDate endDate) {
        return AnalyticsMetrics.UserAnalytics.builder()
                .totalUsers(analyticsRepository.getTotalUsersForDateRange(tenantId, startDate, endDate))
                .activeUsers(analyticsRepository.getActiveUsersForDateRange(tenantId, startDate, endDate))
                .inactiveUsers(analyticsRepository.getInactiveUsersForDateRange(tenantId, startDate, endDate))
                .newUsersToday(analyticsRepository.getNewUsersForDateRange(tenantId, startDate, endDate))
                .newUsersThisWeek(analyticsRepository.getNewUsersForDateRange(tenantId, startDate, endDate))
                .newUsersThisMonth(analyticsRepository.getNewUsersForDateRange(tenantId, startDate, endDate))
                .usersByRole(analyticsRepository.getUsersByRoleForDateRange(tenantId, startDate, endDate))
                .usersByDepartment(analyticsRepository.getUsersByDepartmentForDateRange(tenantId, startDate, endDate))
                .recentUserActivity(analyticsRepository.getRecentUserActivityForDateRange(tenantId, startDate, endDate, 10))
                .activeSessions(analyticsRepository.getActiveSessionsForDateRange(tenantId, startDate, endDate))
                .build();
    }

    private AnalyticsMetrics.PatientAnalytics buildPatientAnalytics(String tenantId) {
        return AnalyticsMetrics.PatientAnalytics.builder()
                .totalPatients(analyticsRepository.getTotalPatients(tenantId))
                .newPatientsToday(analyticsRepository.getNewPatientsToday(tenantId))
                .newPatientsThisWeek(analyticsRepository.getNewPatientsThisWeek(tenantId))
                .newPatientsThisMonth(analyticsRepository.getNewPatientsThisMonth(tenantId))
                .patientsByGender(analyticsRepository.getPatientsByGender(tenantId))
                .patientsByAgeGroup(analyticsRepository.getPatientsByAgeGroup(tenantId))
                .patientsByInsurance(analyticsRepository.getPatientsByInsurance(tenantId))
                .recentVisits(analyticsRepository.getRecentVisits(tenantId, 10))
                .averageVisitsPerPatient(analyticsRepository.getAverageVisitsPerPatient(tenantId))
                .build();
    }

    private AnalyticsMetrics.PatientAnalytics buildPatientAnalyticsForDateRange(String tenantId, LocalDate startDate, LocalDate endDate) {
        return AnalyticsMetrics.PatientAnalytics.builder()
                .totalPatients(analyticsRepository.getTotalPatientsForDateRange(tenantId, startDate, endDate))
                .newPatientsToday(analyticsRepository.getNewPatientsForDateRange(tenantId, startDate, endDate))
                .newPatientsThisWeek(analyticsRepository.getNewPatientsForDateRange(tenantId, startDate, endDate))
                .newPatientsThisMonth(analyticsRepository.getNewPatientsForDateRange(tenantId, startDate, endDate))
                .patientsByGender(analyticsRepository.getPatientsByGenderForDateRange(tenantId, startDate, endDate))
                .patientsByAgeGroup(analyticsRepository.getPatientsByAgeGroupForDateRange(tenantId, startDate, endDate))
                .patientsByInsurance(analyticsRepository.getPatientsByInsuranceForDateRange(tenantId, startDate, endDate))
                .recentVisits(analyticsRepository.getRecentVisitsForDateRange(tenantId, startDate, endDate, 10))
                .averageVisitsPerPatient(analyticsRepository.getAverageVisitsPerPatientForDateRange(tenantId, startDate, endDate))
                .build();
    }

    private AnalyticsMetrics.QueueAnalytics buildQueueAnalytics(String tenantId) {
        return AnalyticsMetrics.QueueAnalytics.builder()
                .totalQueueItems(analyticsRepository.getTotalQueueItems(tenantId))
                .pendingItems(analyticsRepository.getPendingQueueItems(tenantId))
                .completedItems(analyticsRepository.getCompletedQueueItems(tenantId))
                .cancelledItems(analyticsRepository.getCancelledQueueItems(tenantId))
                .itemsByStatus(analyticsRepository.getQueueItemsByStatus(tenantId))
                .itemsByDepartment(analyticsRepository.getQueueItemsByDepartment(tenantId))
                .averageWaitTime(analyticsRepository.getAverageWaitTime(tenantId))
                .averageProcessingTime(analyticsRepository.getAverageProcessingTime(tenantId))
                .queueTrends(analyticsRepository.getQueueTrends(tenantId, 30))
                .bottlenecks(analyticsRepository.getQueueBottlenecks(tenantId))
                .build();
    }

    private AnalyticsMetrics.QueueAnalytics buildQueueAnalyticsForDateRange(String tenantId, LocalDate startDate, LocalDate endDate) {
        return AnalyticsMetrics.QueueAnalytics.builder()
                .totalQueueItems(analyticsRepository.getTotalQueueItemsForDateRange(tenantId, startDate, endDate))
                .pendingItems(analyticsRepository.getPendingQueueItemsForDateRange(tenantId, startDate, endDate))
                .completedItems(analyticsRepository.getCompletedQueueItemsForDateRange(tenantId, startDate, endDate))
                .cancelledItems(analyticsRepository.getCancelledQueueItemsForDateRange(tenantId, startDate, endDate))
                .itemsByStatus(analyticsRepository.getQueueItemsByStatusForDateRange(tenantId, startDate, endDate))
                .itemsByDepartment(analyticsRepository.getQueueItemsByDepartmentForDateRange(tenantId, startDate, endDate))
                .averageWaitTime(analyticsRepository.getAverageWaitTimeForDateRange(tenantId, startDate, endDate))
                .averageProcessingTime(analyticsRepository.getAverageProcessingTimeForDateRange(tenantId, startDate, endDate))
                .queueTrends(analyticsRepository.getQueueTrendsForDateRange(tenantId, startDate, endDate))
                .bottlenecks(analyticsRepository.getQueueBottlenecksForDateRange(tenantId, startDate, endDate))
                .build();
    }

    private AnalyticsMetrics.FinancialAnalytics buildFinancialAnalytics(String tenantId) {
        return AnalyticsMetrics.FinancialAnalytics.builder()
                .totalRevenue(analyticsRepository.getTotalRevenue(tenantId))
                .revenueToday(analyticsRepository.getRevenueToday(tenantId))
                .revenueThisWeek(analyticsRepository.getRevenueThisWeek(tenantId))
                .revenueThisMonth(analyticsRepository.getRevenueThisMonth(tenantId))
                .totalBills(analyticsRepository.getTotalBillsAmount(tenantId))
                .paidBills(analyticsRepository.getPaidBillsAmount(tenantId))
                .pendingBills(analyticsRepository.getPendingBillsAmount(tenantId))
                .cancelledBills(analyticsRepository.getCancelledBillsAmount(tenantId))
                .revenueByDepartment(analyticsRepository.getRevenueByDepartment(tenantId))
                .revenueByService(analyticsRepository.getRevenueByService(tenantId))
                .revenueTrends(analyticsRepository.getRevenueTrends(tenantId, 30))
                .paymentMethodStats(analyticsRepository.getPaymentMethodStats(tenantId))
                .build();
    }

    private AnalyticsMetrics.FinancialAnalytics buildFinancialAnalyticsForDateRange(String tenantId, LocalDate startDate, LocalDate endDate) {
        return AnalyticsMetrics.FinancialAnalytics.builder()
                .totalRevenue(analyticsRepository.getTotalRevenueForDateRange(tenantId, startDate, endDate))
                .revenueToday(analyticsRepository.getRevenueForDateRange(tenantId, startDate, endDate))
                .revenueThisWeek(analyticsRepository.getRevenueForDateRange(tenantId, startDate, endDate))
                .revenueThisMonth(analyticsRepository.getRevenueForDateRange(tenantId, startDate, endDate))
                .totalBills(analyticsRepository.getTotalBillsAmountForDateRange(tenantId, startDate, endDate))
                .paidBills(analyticsRepository.getPaidBillsAmountForDateRange(tenantId, startDate, endDate))
                .pendingBills(analyticsRepository.getPendingBillsAmountForDateRange(tenantId, startDate, endDate))
                .cancelledBills(analyticsRepository.getCancelledBillsAmountForDateRange(tenantId, startDate, endDate))
                .revenueByDepartment(analyticsRepository.getRevenueByDepartmentForDateRange(tenantId, startDate, endDate))
                .revenueByService(analyticsRepository.getRevenueByServiceForDateRange(tenantId, startDate, endDate))
                .revenueTrends(analyticsRepository.getRevenueTrendsForDateRange(tenantId, startDate, endDate))
                .paymentMethodStats(analyticsRepository.getPaymentMethodStatsForDateRange(tenantId, startDate, endDate))
                .build();
    }

    private AnalyticsMetrics.DepartmentAnalytics buildDepartmentAnalytics(String tenantId) {
        return AnalyticsMetrics.DepartmentAnalytics.builder()
                .departmentStats(analyticsRepository.getDepartmentStats(tenantId))
                .topPerformers(analyticsRepository.getTopPerformingDepartments(tenantId))
                .underPerformers(analyticsRepository.getUnderPerformingDepartments(tenantId))
                .workloadDistribution(analyticsRepository.getWorkloadDistribution(tenantId))
                .build();
    }

    private AnalyticsMetrics.DepartmentAnalytics buildDepartmentAnalyticsForDateRange(String tenantId, LocalDate startDate, LocalDate endDate) {
        return AnalyticsMetrics.DepartmentAnalytics.builder()
                .departmentStats(analyticsRepository.getDepartmentStatsForDateRange(tenantId, startDate, endDate))
                .topPerformers(analyticsRepository.getTopPerformingDepartmentsForDateRange(tenantId, startDate, endDate))
                .underPerformers(analyticsRepository.getUnderPerformingDepartmentsForDateRange(tenantId, startDate, endDate))
                .workloadDistribution(analyticsRepository.getWorkloadDistributionForDateRange(tenantId, startDate, endDate))
                .build();
    }

    private AnalyticsMetrics.TimeBasedAnalytics buildTimeBasedAnalytics(String tenantId) {
        return AnalyticsMetrics.TimeBasedAnalytics.builder()
                .hourlyActivity(analyticsRepository.getHourlyActivity(tenantId))
                .dailyActivity(analyticsRepository.getDailyActivity(tenantId))
                .weeklyActivity(analyticsRepository.getWeeklyActivity(tenantId))
                .monthlyActivity(analyticsRepository.getMonthlyActivity(tenantId))
                .peakHours(analyticsRepository.getPeakHours(tenantId))
                .seasonalTrends(analyticsRepository.getSeasonalTrends(tenantId))
                .build();
    }

    private AnalyticsMetrics.TimeBasedAnalytics buildTimeBasedAnalyticsForDateRange(String tenantId, LocalDate startDate, LocalDate endDate) {
        return AnalyticsMetrics.TimeBasedAnalytics.builder()
                .hourlyActivity(analyticsRepository.getHourlyActivityForDateRange(tenantId, startDate, endDate))
                .dailyActivity(analyticsRepository.getDailyActivityForDateRange(tenantId, startDate, endDate))
                .weeklyActivity(analyticsRepository.getWeeklyActivityForDateRange(tenantId, startDate, endDate))
                .monthlyActivity(analyticsRepository.getMonthlyActivityForDateRange(tenantId, startDate, endDate))
                .peakHours(analyticsRepository.getPeakHoursForDateRange(tenantId, startDate, endDate))
                .seasonalTrends(analyticsRepository.getSeasonalTrendsForDateRange(tenantId, startDate, endDate))
                .build();
    }

    private AnalyticsMetrics.PerformanceMetrics buildPerformanceMetrics(String tenantId) {
        return AnalyticsMetrics.PerformanceMetrics.builder()
                .averageResponseTime(analyticsRepository.getAverageResponseTime(tenantId))
                .systemAvailability(analyticsRepository.getSystemAvailability(tenantId))
                .totalErrors(analyticsRepository.getTotalErrors(tenantId))
                .errorsToday(analyticsRepository.getErrorsToday(tenantId))
                .errorsByType(analyticsRepository.getErrorsByType(tenantId))
                .systemAlerts(analyticsRepository.getSystemAlerts(tenantId))
                .performanceIssues(analyticsRepository.getPerformanceIssues(tenantId))
                .build();
    }

    private AnalyticsMetrics.PerformanceMetrics buildPerformanceMetricsForDateRange(String tenantId, LocalDate startDate, LocalDate endDate) {
        return AnalyticsMetrics.PerformanceMetrics.builder()
                .averageResponseTime(analyticsRepository.getAverageResponseTimeForDateRange(tenantId, startDate, endDate))
                .systemAvailability(analyticsRepository.getSystemAvailabilityForDateRange(tenantId, startDate, endDate))
                .totalErrors(analyticsRepository.getTotalErrorsForDateRange(tenantId, startDate, endDate))
                .errorsToday(analyticsRepository.getErrorsForDateRange(tenantId, startDate, endDate))
                .errorsByType(analyticsRepository.getErrorsByTypeForDateRange(tenantId, startDate, endDate))
                .systemAlerts(analyticsRepository.getSystemAlertsForDateRange(tenantId, startDate, endDate))
                .performanceIssues(analyticsRepository.getPerformanceIssuesForDateRange(tenantId, startDate, endDate))
                .build();
    }

    private String calculateSystemUptime() {
        // This would typically be calculated from system logs
        return "99.9%";
    }

    private double calculateSystemLoad() {
        // This would typically be calculated from system metrics
        return 0.75;
    }
}
