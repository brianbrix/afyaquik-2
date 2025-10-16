package com.afyaquik.hms.reports.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.reports.domain.PatientReport;

/**
 * Repository for report data access.
 */
@Repository
public interface ReportRepository {
    
    // Patient Reports
    @Query("SELECT new com.afyaquik.hms.reports.domain.PatientReport(" +
           "p.medicalRecordNumber, p.firstName || ' ' || p.lastName, p.phone, p.email, " +
           "p.dateOfBirth, p.gender, p.address, p.city, p.state, p.country, " +
           "p.createdAt, p.updatedAt, " +
           "(SELECT COUNT(v) FROM Visit v WHERE v.patientId = p.id), " +
           "(SELECT COUNT(b) FROM Bill b WHERE b.patientId = p.id), " +
           "'Active', 'Active') " +
           "FROM Patient p " +
           "WHERE p.tenantId = :tenantId " +
           "AND (:startDate IS NULL OR p.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR p.createdAt <= :endDate)")
    List<PatientReport> getPatientReportData(@Param("tenantId") String tenantId,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);
    
    // Financial Reports
    @Query("SELECT SUM(b.totalAmount) FROM Bill b WHERE b.tenantId = :tenantId " +
           "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR b.createdAt <= :endDate)")
    Double getTotalRevenue(@Param("tenantId") String tenantId,
                          @Param("startDate") LocalDate startDate,
                          @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(b) FROM Bill b WHERE b.tenantId = :tenantId " +
           "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR b.createdAt <= :endDate)")
    Long getTotalBills(@Param("tenantId") String tenantId,
                       @Param("startDate") LocalDate startDate,
                       @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(b.paidAmount) FROM Bill b WHERE b.tenantId = :tenantId " +
           "AND b.status = 'PAID' " +
           "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR b.createdAt <= :endDate)")
    Double getPaidAmount(@Param("tenantId") String tenantId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(b.balanceDue) FROM Bill b WHERE b.tenantId = :tenantId " +
           "AND b.status = 'PENDING' " +
           "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR b.createdAt <= :endDate)")
    Double getPendingAmount(@Param("tenantId") String tenantId,
                          @Param("startDate") LocalDate startDate,
                          @Param("endDate") LocalDate endDate);
    
    // Operational Reports
    @Query("SELECT COUNT(p) FROM Patient p WHERE p.tenantId = :tenantId " +
           "AND (:startDate IS NULL OR p.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR p.createdAt <= :endDate)")
    Long getTotalPatients(@Param("tenantId") String tenantId,
                         @Param("startDate") LocalDate startDate,
                         @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(q) FROM QueueItem q WHERE q.tenantId = :tenantId " +
           "AND (:startDate IS NULL OR q.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR q.createdAt <= :endDate)")
    Long getTotalQueueItems(@Param("tenantId") String tenantId,
                           @Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(u) FROM UserProfile u WHERE u.tenantId = :tenantId " +
           "AND u.isActive = true")
    Long getActiveUsers(@Param("tenantId") String tenantId);
    
    // Department-wise revenue
    @Query("SELECT d.name, SUM(b.totalAmount), COUNT(b) " +
           "FROM Bill b " +
           "JOIN b.queueItem q " +
           "JOIN q.department d " +
           "WHERE b.tenantId = :tenantId " +
           "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR b.createdAt <= :endDate) " +
           "GROUP BY d.name")
    List<Object[]> getRevenueByDepartment(@Param("tenantId") String tenantId,
                                        @Param("startDate") LocalDate startDate,
                                        @Param("endDate") LocalDate endDate);
    
    // Daily revenue trend
    @Query("SELECT DATE(b.createdAt), SUM(b.totalAmount), COUNT(b) " +
           "FROM Bill b " +
           "WHERE b.tenantId = :tenantId " +
           "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR b.createdAt <= :endDate) " +
           "GROUP BY DATE(b.createdAt) " +
           "ORDER BY DATE(b.createdAt)")
    List<Object[]> getDailyRevenue(@Param("tenantId") String tenantId,
                                  @Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate);
    
    // Bill status summary
    @Query("SELECT b.status, COUNT(b), SUM(b.totalAmount) " +
           "FROM Bill b " +
           "WHERE b.tenantId = :tenantId " +
           "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR b.createdAt <= :endDate) " +
           "GROUP BY b.status")
    List<Object[]> getBillStatusSummary(@Param("tenantId") String tenantId,
                                       @Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);
    
    // Outstanding bills
    @Query("SELECT b.billNumber, b.patientName, b.createdAt, b.totalAmount, " +
           "b.paidAmount, b.balanceDue, DATEDIFF(CURRENT_DATE, b.createdAt) " +
           "FROM Bill b " +
           "WHERE b.tenantId = :tenantId " +
           "AND b.status = 'PENDING' " +
           "AND b.balanceDue > 0 " +
           "ORDER BY b.createdAt ASC")
    List<Object[]> getOutstandingBills(@Param("tenantId") String tenantId);
    
    // User activity
    @Query("SELECT u.username, u.firstName || ' ' || u.lastName, u.department, u.role, " +
           "COUNT(a.id), u.lastLogin, u.updatedAt " +
           "FROM UserProfile u " +
           "LEFT JOIN AuditLog a ON a.userId = u.id " +
           "WHERE u.tenantId = :tenantId " +
           "AND (:startDate IS NULL OR a.timestamp >= :startDate) " +
           "AND (:endDate IS NULL OR a.timestamp <= :endDate) " +
           "GROUP BY u.id, u.username, u.firstName, u.lastName, u.department, u.role, u.lastLogin, u.updatedAt")
    List<Object[]> getUserActivity(@Param("tenantId") String tenantId,
                                  @Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(b) FROM Bill b WHERE b.tenantId = :tenantId " +
           "AND b.status = 'PAID' " +
           "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR b.createdAt <= :endDate)")
    Long getTotalPaidBills(@Param("tenantId") String tenantId,
                          @Param("startDate") LocalDate startDate,
                          @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(b) FROM Bill b WHERE b.tenantId = :tenantId " +
           "AND b.status = 'PENDING' " +
           "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR b.createdAt <= :endDate)")
    Long getTotalPendingBills(@Param("tenantId") String tenantId,
                             @Param("startDate") LocalDate startDate,
                             @Param("endDate") LocalDate endDate);

    // User-specific billing methods
    @Query("SELECT b.billNumber, b.totalAmount, b.patientName, b.status " +
           "FROM Bill b WHERE b.tenantId = :tenantId " +
           "AND b.createdBy = :username " +
           "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR b.createdAt <= :endDate) " +
           "ORDER BY b.createdAt DESC")
    List<Object[]> getUserBills(@Param("tenantId") String tenantId,
                               @Param("username") String username,
                               @Param("startDate") LocalDate startDate,
                               @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(b.totalAmount) FROM Bill b WHERE b.tenantId = :tenantId " +
           "AND b.createdBy = :username " +
           "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR b.createdAt <= :endDate)")
    Double getUserRevenue(@Param("tenantId") String tenantId,
                         @Param("username") String username,
                         @Param("startDate") LocalDate startDate,
                         @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(b) FROM Bill b WHERE b.tenantId = :tenantId " +
           "AND b.createdBy = :username " +
           "AND (:startDate IS NULL OR b.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR b.createdAt <= :endDate)")
    Long getUserBillCount(@Param("tenantId") String tenantId,
                         @Param("username") String username,
                         @Param("startDate") LocalDate startDate,
                         @Param("endDate") LocalDate endDate);

    // User-specific queue methods
    @Query("SELECT q.id, q.priority, p.firstName || ' ' || p.lastName, q.currentStatus, q.departmentId " +
           "FROM VisitQueueItem q " +
           "JOIN q.patient p " +
           "WHERE q.tenantId = :tenantId " +
           "AND q.currentAssigneeId = :username " +
           "AND (:startDate IS NULL OR q.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR q.createdAt <= :endDate) " +
           "ORDER BY q.createdAt DESC")
    List<Object[]> getUserQueueItems(@Param("tenantId") String tenantId,
                                    @Param("username") String username,
                                    @Param("startDate") LocalDate startDate,
                                    @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(q) FROM VisitQueueItem q WHERE q.tenantId = :tenantId " +
           "AND q.currentAssigneeId = :username " +
           "AND (:startDate IS NULL OR q.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR q.createdAt <= :endDate)")
    Long getUserQueueCount(@Param("tenantId") String tenantId,
                          @Param("username") String username,
                          @Param("startDate") LocalDate startDate,
                          @Param("endDate") LocalDate endDate);

    // User-specific activity methods
    @Query("SELECT a.action, COUNT(a), a.timestamp, a.endpoint " +
           "FROM AuditLog a WHERE a.tenantId = :tenantId " +
           "AND a.username = :username " +
           "AND (:startDate IS NULL OR a.timestamp >= :startDate) " +
           "AND (:endDate IS NULL OR a.timestamp <= :endDate) " +
           "GROUP BY a.action, a.timestamp, a.endpoint " +
           "ORDER BY a.timestamp DESC")
    List<Object[]> getUserActivityForUser(@Param("tenantId") String tenantId,
                                         @Param("username") String username,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.tenantId = :tenantId " +
           "AND a.username = :username " +
           "AND (:startDate IS NULL OR a.timestamp >= :startDate) " +
           "AND (:endDate IS NULL OR a.timestamp <= :endDate)")
    Long getUserTotalActions(@Param("tenantId") String tenantId,
                            @Param("username") String username,
                            @Param("startDate") LocalDate startDate,
                            @Param("endDate") LocalDate endDate);
}
