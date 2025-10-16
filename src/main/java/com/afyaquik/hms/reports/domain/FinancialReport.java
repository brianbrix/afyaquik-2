package com.afyaquik.hms.reports.domain;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Financial report data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialReport {
    
    private String reportPeriod;
    private LocalDate startDate;
    private LocalDate endDate;
    private FinancialSummary summary;
    private List<RevenueByDepartment> revenueByDepartment;
    private List<RevenueByService> revenueByService;
    private List<PaymentMethodSummary> paymentMethods;
    private List<BillStatusSummary> billStatuses;
    private List<DailyRevenue> dailyRevenue;
    private List<MonthlyTrend> monthlyTrends;
    private List<OutstandingBills> outstandingBills;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinancialSummary {
        private BigDecimal totalRevenue;
        private BigDecimal totalBills;
        private BigDecimal paidAmount;
        private BigDecimal pendingAmount;
        private BigDecimal cancelledAmount;
        private BigDecimal refundedAmount;
        private BigDecimal averageBillAmount;
        private long totalTransactions;
        private BigDecimal revenueGrowth;
        private BigDecimal collectionRate;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueByDepartment {
        private String department;
        private BigDecimal revenue;
        private long billCount;
        private BigDecimal averageBill;
        private BigDecimal percentage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueByService {
        private String serviceName;
        private String serviceCode;
        private BigDecimal revenue;
        private long serviceCount;
        private BigDecimal averagePrice;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentMethodSummary {
        private String paymentMethod;
        private BigDecimal amount;
        private long transactionCount;
        private BigDecimal percentage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BillStatusSummary {
        private String status;
        private long count;
        private BigDecimal amount;
        private BigDecimal percentage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRevenue {
        private LocalDate date;
        private BigDecimal revenue;
        private long billCount;
        private BigDecimal averageBill;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrend {
        private String month;
        private BigDecimal revenue;
        private long billCount;
        private BigDecimal growth;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OutstandingBills {
        private String billNumber;
        private String patientName;
        private LocalDate billDate;
        private BigDecimal amount;
        private BigDecimal paidAmount;
        private BigDecimal balance;
        private long daysOutstanding;
    }
}
