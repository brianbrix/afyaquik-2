package com.afyaquik.hms.reports.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Operational report data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationalReport {
    
    private String reportPeriod;
    private LocalDate startDate;
    private LocalDate endDate;
    private OperationalSummary summary;
    private List<QueuePerformance> queuePerformance;
    private List<DepartmentPerformance> departmentPerformance;
    private List<UserActivity> userActivity;
    private List<SystemMetrics> systemMetrics;
    private List<PatientFlow> patientFlow;
    private List<AppointmentTrends> appointmentTrends;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OperationalSummary {
        private long totalPatients;
        private long totalVisits;
        private long totalAppointments;
        private long totalQueueItems;
        private double averageWaitTime;
        private double averageServiceTime;
        private double patientSatisfaction;
        private long totalUsers;
        private long activeUsers;
        private double systemUptime;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QueuePerformance {
        private String department;
        private long totalItems;
        private long completedItems;
        private long pendingItems;
        private double averageWaitTime;
        private double averageServiceTime;
        private double completionRate;
        private double efficiency;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentPerformance {
        private String department;
        private long totalPatients;
        private long totalVisits;
        private double averageVisitDuration;
        private double patientSatisfaction;
        private long totalStaff;
        private double staffUtilization;
        private double departmentEfficiency;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserActivity {
        private String username;
        private String fullName;
        private String department;
        private String role;
        private long loginCount;
        private long totalActions;
        private LocalDateTime lastLogin;
        private LocalDateTime lastActivity;
        private double activityScore;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemMetrics {
        private String metricName;
        private double currentValue;
        private double targetValue;
        private double performance;
        private String status;
        private String trend;
        private LocalDateTime lastUpdated;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientFlow {
        private LocalDate date;
        private long arrivals;
        private long departures;
        private long inQueue;
        private double averageWaitTime;
        private double peakHour;
        private double utilization;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AppointmentTrends {
        private String period;
        private long totalAppointments;
        private long completedAppointments;
        private long cancelledAppointments;
        private long noShowAppointments;
        private double completionRate;
        private double noShowRate;
    }
}
