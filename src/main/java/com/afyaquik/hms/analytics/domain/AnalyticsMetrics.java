package com.afyaquik.hms.analytics.domain;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Comprehensive analytics metrics for the HMS system.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsMetrics {
    
    // System Overview
    private SystemOverview systemOverview;
    
    // User Analytics
    private UserAnalytics userAnalytics;
    
    // Patient Analytics
    private PatientAnalytics patientAnalytics;
    
    // Queue Analytics
    private QueueAnalytics queueAnalytics;
    
    // Financial Analytics
    private FinancialAnalytics financialAnalytics;
    
    // Department Analytics
    private DepartmentAnalytics departmentAnalytics;
    
    // Time-based Analytics
    private TimeBasedAnalytics timeBasedAnalytics;
    
    // Performance Metrics
    private PerformanceMetrics performanceMetrics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemOverview {
        private long totalUsers;
        private long activeUsers;
        private long totalPatients;
        private long totalQueueItems;
        private long totalBills;
        private BigDecimal totalRevenue;
        private long totalPrescriptions;
        private long totalDiagnosticOrders;
        private String systemUptime;
        private double systemLoad;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserAnalytics {
        private long totalUsers;
        private long activeUsers;
        private long inactiveUsers;
        private long newUsersToday;
        private long newUsersThisWeek;
        private long newUsersThisMonth;
        private Map<String, Long> usersByRole;
        private Map<String, Long> usersByDepartment;
        private List<UserActivity> recentUserActivity;
        private List<UserSession> activeSessions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientAnalytics {
        private long totalPatients;
        private long newPatientsToday;
        private long newPatientsThisWeek;
        private long newPatientsThisMonth;
        private Map<String, Long> patientsByGender;
        private Map<String, Long> patientsByAgeGroup;
        private Map<String, Long> patientsByInsurance;
        private List<PatientVisit> recentVisits;
        private double averageVisitsPerPatient;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QueueAnalytics {
        private long totalQueueItems;
        private long pendingItems;
        private long completedItems;
        private long cancelledItems;
        private Map<String, Long> itemsByStatus;
        private Map<String, Long> itemsByDepartment;
        private double averageWaitTime;
        private double averageProcessingTime;
        private List<QueueTrend> queueTrends;
        private List<QueueBottleneck> bottlenecks;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinancialAnalytics {
        private BigDecimal totalRevenue;
        private BigDecimal revenueToday;
        private BigDecimal revenueThisWeek;
        private BigDecimal revenueThisMonth;
        private BigDecimal totalBills;
        private BigDecimal paidBills;
        private BigDecimal pendingBills;
        private BigDecimal cancelledBills;
        private Map<String, BigDecimal> revenueByDepartment;
        private Map<String, BigDecimal> revenueByService;
        private List<FinancialTrend> revenueTrends;
        private List<PaymentMethod> paymentMethodStats;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentAnalytics {
        private Map<String, DepartmentStats> departmentStats;
        private List<DepartmentPerformance> topPerformers;
        private List<DepartmentPerformance> underPerformers;
        private Map<String, Long> workloadDistribution;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeBasedAnalytics {
        private Map<String, Long> hourlyActivity;
        private Map<String, Long> dailyActivity;
        private Map<String, Long> weeklyActivity;
        private Map<String, Long> monthlyActivity;
        private List<PeakHours> peakHours;
        private List<SeasonalTrend> seasonalTrends;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceMetrics {
        private double averageResponseTime;
        private double systemAvailability;
        private long totalErrors;
        private long errorsToday;
        private Map<String, Long> errorsByType;
        private List<SystemAlert> systemAlerts;
        private List<PerformanceIssue> performanceIssues;
    }

    // Supporting data classes
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserActivity {
        private String username;
        private String action;
        private String timestamp;
        private String details;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSession {
        private String username;
        private String loginTime;
        private String lastActivity;
        private String ipAddress;
        private String userAgent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientVisit {
        private String patientName;
        private String visitDate;
        private String department;
        private String status;
        private String doctor;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QueueTrend {
        private String date;
        private long count;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QueueBottleneck {
        private String department;
        private String status;
        private long count;
        private double averageWaitTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinancialTrend {
        private String date;
        private BigDecimal amount;
        private String category;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentMethod {
        private String method;
        private long count;
        private BigDecimal totalAmount;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentStats {
        private String department;
        private long totalPatients;
        private long totalQueueItems;
        private BigDecimal totalRevenue;
        private double averageWaitTime;
        private double satisfactionScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentPerformance {
        private String department;
        private double performanceScore;
        private String metrics;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeakHours {
        private String hour;
        private long activityCount;
        private String department;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeasonalTrend {
        private String period;
        private long count;
        private String trend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemAlert {
        private String type;
        private String message;
        private String severity;
        private String timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceIssue {
        private String component;
        private String issue;
        private String severity;
        private String recommendation;
    }
}
