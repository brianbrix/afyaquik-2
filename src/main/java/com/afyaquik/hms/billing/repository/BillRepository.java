package com.afyaquik.hms.billing.repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.billing.domain.Bill;
import com.afyaquik.hms.billing.domain.BillStatus;
import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

/**
 * Repository for Bill entity.
 */
@Repository
public interface BillRepository extends TenantAwareRepository<Bill, Long> {

    /**
     * Find bills by patient ID.
     */
    List<Bill> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    
    /**
     * Find bills by patient ID and tenant.
     */
    List<Bill> findByTenantIdAndPatientIdOrderByCreatedAtDesc(String tenantId, Long patientId);

    /**
     * Find bills by queue item ID.
     */
    List<Bill> findByQueueItemIdOrderByCreatedAtDesc(Long queueItemId);
    
    /**
     * Find bills by queue item ID and tenant.
     */
    List<Bill> findByTenantIdAndQueueItemIdOrderByCreatedAtDesc(String tenantId, Long queueItemId);

    /**
     * Find bills by status.
     */
    Page<Bill> findByStatusOrderByCreatedAtDesc(BillStatus status, Pageable pageable);
    
    /**
     * Find bills by status and tenant.
     */
    Page<Bill> findByTenantIdAndStatusOrderByCreatedAtDesc(String tenantId, BillStatus status, Pageable pageable);

    /**
     * Find bills by patient ID and status.
     */
    List<Bill> findByPatientIdAndStatusOrderByCreatedAtDesc(Long patientId, BillStatus status);
    
    /**
     * Find bills by patient ID, status and tenant.
     */
    List<Bill> findByTenantIdAndPatientIdAndStatusOrderByCreatedAtDesc(String tenantId, Long patientId, BillStatus status);

    /**
     * Find bills by bill number.
     */
    Optional<Bill> findByBillNumber(String billNumber);
    
    /**
     * Find bills by bill number and tenant.
     */
    Optional<Bill> findByTenantIdAndBillNumber(String tenantId, String billNumber);
    
    /**
     * Find bill by payment ID.
     */
    Optional<Bill> findByPaymentsId(Long paymentId);

    /**
     * Find overdue bills (bills with due date in the past and status not paid).
     */
    @Query("SELECT b FROM Bill b WHERE b.dueDate < :currentDate AND b.status NOT IN ('PAID', 'CANCELLED', 'REFUNDED')")
    List<Bill> findOverdueBills(@Param("currentDate") OffsetDateTime currentDate);
    
    /**
     * Find overdue bills by tenant.
     */
    @Query("SELECT b FROM Bill b WHERE b.tenantId = :tenantId AND b.dueDate < :currentDate AND b.status NOT IN ('PAID', 'CANCELLED', 'REFUNDED')")
    List<Bill> findOverdueBillsByTenant(@Param("tenantId") String tenantId, @Param("currentDate") OffsetDateTime currentDate);

    /**
     * Find bills with balance due greater than zero.
     */
    @Query("SELECT b FROM Bill b WHERE b.balanceDue > 0")
    List<Bill> findBillsWithBalanceDue();
    
    /**
     * Find bills with balance due greater than zero by tenant.
     */
    @Query("SELECT b FROM Bill b WHERE b.tenantId = :tenantId AND b.balanceDue > 0")
    List<Bill> findBillsWithBalanceDueByTenant(@Param("tenantId") String tenantId);

    /**
     * Calculate total amount for bills by patient.
     */
    @Query("SELECT SUM(b.totalAmount) FROM Bill b WHERE b.patientId = :patientId")
    Optional<java.math.BigDecimal> getTotalAmountByPatient(@Param("patientId") Long patientId);
    
    /**
     * Calculate total amount for bills by patient and tenant.
     */
    @Query("SELECT SUM(b.totalAmount) FROM Bill b WHERE b.tenantId = :tenantId AND b.patientId = :patientId")
    Optional<java.math.BigDecimal> getTotalAmountByPatientAndTenant(@Param("tenantId") String tenantId, @Param("patientId") Long patientId);

    /**
     * Calculate total paid amount for bills by patient.
     */
    @Query("SELECT SUM(b.paidAmount) FROM Bill b WHERE b.patientId = :patientId")
    Optional<java.math.BigDecimal> getTotalPaidAmountByPatient(@Param("patientId") Long patientId);
    
    /**
     * Calculate total paid amount for bills by patient and tenant.
     */
    @Query("SELECT SUM(b.paidAmount) FROM Bill b WHERE b.tenantId = :tenantId AND b.patientId = :patientId")
    Optional<java.math.BigDecimal> getTotalPaidAmountByPatientAndTenant(@Param("tenantId") String tenantId, @Param("patientId") Long patientId);

    /**
     * Find bills created within a date range.
     */
    @Query("SELECT b FROM Bill b WHERE b.billingDate BETWEEN :startDate AND :endDate ORDER BY b.billingDate DESC")
    List<Bill> findBillsByDateRange(@Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);
    
    /**
     * Find bills created within a date range by tenant.
     */
    @Query("SELECT b FROM Bill b WHERE b.tenantId = :tenantId AND b.billingDate BETWEEN :startDate AND :endDate ORDER BY b.billingDate DESC")
    List<Bill> findBillsByDateRangeAndTenant(@Param("tenantId") String tenantId, @Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    /**
     * Count bills by status.
     */
    long countByStatus(BillStatus status);
    
    /**
     * Count bills by status and tenant.
     */
    long countByTenantIdAndStatus(String tenantId, BillStatus status);

    /**
     * Find bills with total amount greater than specified amount.
     */
    @Query("SELECT b FROM Bill b WHERE b.totalAmount > :amount ORDER BY b.totalAmount DESC")
    List<Bill> findBillsWithAmountGreaterThan(@Param("amount") java.math.BigDecimal amount);
    
    /**
     * Find bills with total amount greater than specified amount by tenant.
     */
    @Query("SELECT b FROM Bill b WHERE b.tenantId = :tenantId AND b.totalAmount > :amount ORDER BY b.totalAmount DESC")
    List<Bill> findBillsWithAmountGreaterThanByTenant(@Param("tenantId") String tenantId, @Param("amount") java.math.BigDecimal amount);
    
    // Tenant-aware default methods
    default List<Bill> findByPatientIdForCurrentTenant(Long patientId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndPatientIdOrderByCreatedAtDesc(tenantId, patientId);
    }
    
    default List<Bill> findByQueueItemIdForCurrentTenant(Long queueItemId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndQueueItemIdOrderByCreatedAtDesc(tenantId, queueItemId);
    }
    
    default Page<Bill> findByStatusForCurrentTenant(BillStatus status, Pageable pageable) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndStatusOrderByCreatedAtDesc(tenantId, status, pageable);
    }
    
    default Optional<Bill> findByBillNumberForCurrentTenant(String billNumber) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndBillNumber(tenantId, billNumber);
    }
    
    default List<Bill> findOverdueBillsForCurrentTenant(OffsetDateTime currentDate) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findOverdueBillsByTenant(tenantId, currentDate);
    }
    
    default List<Bill> findBillsWithBalanceDueForCurrentTenant() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findBillsWithBalanceDueByTenant(tenantId);
    }
    
    default Optional<java.math.BigDecimal> getTotalAmountByPatientForCurrentTenant(Long patientId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return getTotalAmountByPatientAndTenant(tenantId, patientId);
    }
    
    default Optional<java.math.BigDecimal> getTotalPaidAmountByPatientForCurrentTenant(Long patientId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return getTotalPaidAmountByPatientAndTenant(tenantId, patientId);
    }
    
    default List<Bill> findBillsByDateRangeForCurrentTenant(OffsetDateTime startDate, OffsetDateTime endDate) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findBillsByDateRangeAndTenant(tenantId, startDate, endDate);
    }
    
    default long countByStatusForCurrentTenant(BillStatus status) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return countByTenantIdAndStatus(tenantId, status);
    }
    
    default List<Bill> findBillsWithAmountGreaterThanForCurrentTenant(java.math.BigDecimal amount) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findBillsWithAmountGreaterThanByTenant(tenantId, amount);
    }
}
