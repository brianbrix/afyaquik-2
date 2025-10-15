package com.afyaquik.hms.billing.repository;

import com.afyaquik.hms.billing.domain.Bill;
import com.afyaquik.hms.billing.domain.BillStatus;
import com.afyaquik.hms.common.repository.TenantAwareRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Example of how to update BillRepository to use TenantAwareRepository.
 * This shows how all repository methods can be made tenant-aware automatically.
 */
public interface BillRepositoryTenantAware extends TenantAwareRepository<Bill, Long> {

    // Tenant-aware methods are now available automatically:
    // - findAllForCurrentTenant()
    // - findByIdForCurrentTenant(Long id)
    // - existsByIdForCurrentTenant(Long id)
    // - countForCurrentTenant()
    // - deleteByIdForCurrentTenant(Long id)
    // - deleteAllForCurrentTenant()

    // Custom tenant-aware methods using default methods
    default List<Bill> findByPatientIdForCurrentTenant(Long patientId) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndPatientIdOrderByCreatedAtDesc(tenantId, patientId);
    }

    default List<Bill> findByQueueItemIdForCurrentTenant(Long queueItemId) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndQueueItemIdOrderByCreatedAtDesc(tenantId, queueItemId);
    }

    default Page<Bill> findByStatusForCurrentTenant(BillStatus status, Pageable pageable) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndStatusOrderByCreatedAtDesc(tenantId, status, pageable);
    }

    default Optional<Bill> findByBillNumberForCurrentTenant(String billNumber) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndBillNumber(tenantId, billNumber);
    }

    default List<Bill> findOverdueBillsForCurrentTenant(OffsetDateTime currentDate) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return findOverdueBillsByTenant(tenantId, currentDate);
    }

    default List<Bill> findBillsWithBalanceDueForCurrentTenant() {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return findBillsWithBalanceDueByTenant(tenantId);
    }

    default Optional<BigDecimal> getTotalAmountByPatientForCurrentTenant(Long patientId) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return getTotalAmountByPatientAndTenant(tenantId, patientId);
    }

    default Optional<BigDecimal> getTotalPaidAmountByPatientForCurrentTenant(Long patientId) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return getTotalPaidAmountByPatientAndTenant(tenantId, patientId);
    }

    default List<Bill> findBillsByDateRangeForCurrentTenant(OffsetDateTime startDate, OffsetDateTime endDate) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return findBillsByDateRangeAndTenant(tenantId, startDate, endDate);
    }

    default long countByStatusForCurrentTenant(BillStatus status) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return countByTenantIdAndStatus(tenantId, status);
    }

    default List<Bill> findBillsWithAmountGreaterThanForCurrentTenant(BigDecimal amount) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return findBillsWithAmountGreaterThanByTenant(tenantId, amount);
    }

    // Keep existing tenant-aware methods (these are the actual implementations)
    List<Bill> findByTenantIdAndPatientIdOrderByCreatedAtDesc(String tenantId, Long patientId);
    List<Bill> findByTenantIdAndQueueItemIdOrderByCreatedAtDesc(String tenantId, Long queueItemId);
    Page<Bill> findByTenantIdAndStatusOrderByCreatedAtDesc(String tenantId, BillStatus status, Pageable pageable);
    Optional<Bill> findByTenantIdAndBillNumber(String tenantId, String billNumber);
    
    @Query("SELECT b FROM Bill b WHERE b.tenantId = :tenantId AND b.dueDate < :currentDate AND b.status NOT IN ('PAID', 'CANCELLED', 'REFUNDED')")
    List<Bill> findOverdueBillsByTenant(@Param("tenantId") String tenantId, @Param("currentDate") OffsetDateTime currentDate);
    
    @Query("SELECT b FROM Bill b WHERE b.tenantId = :tenantId AND b.balanceDue > 0")
    List<Bill> findBillsWithBalanceDueByTenant(@Param("tenantId") String tenantId);
    
    @Query("SELECT SUM(b.totalAmount) FROM Bill b WHERE b.tenantId = :tenantId AND b.patientId = :patientId")
    Optional<BigDecimal> getTotalAmountByPatientAndTenant(@Param("tenantId") String tenantId, @Param("patientId") Long patientId);
    
    @Query("SELECT SUM(b.paidAmount) FROM Bill b WHERE b.tenantId = :tenantId AND b.patientId = :patientId")
    Optional<BigDecimal> getTotalPaidAmountByPatientAndTenant(@Param("tenantId") String tenantId, @Param("patientId") Long patientId);
    
    @Query("SELECT b FROM Bill b WHERE b.tenantId = :tenantId AND b.billingDate BETWEEN :startDate AND :endDate ORDER BY b.billingDate DESC")
    List<Bill> findBillsByDateRangeAndTenant(@Param("tenantId") String tenantId, @Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);
    
    long countByTenantIdAndStatus(String tenantId, BillStatus status);
    
    @Query("SELECT b FROM Bill b WHERE b.tenantId = :tenantId AND b.totalAmount > :amount ORDER BY b.totalAmount DESC")
    List<Bill> findBillsWithAmountGreaterThanByTenant(@Param("tenantId") String tenantId, @Param("amount") BigDecimal amount);
}
