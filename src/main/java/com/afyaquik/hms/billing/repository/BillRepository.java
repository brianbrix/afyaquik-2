package com.afyaquik.hms.billing.repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.billing.domain.Bill;
import com.afyaquik.hms.billing.domain.BillStatus;

/**
 * Repository for Bill entity.
 */
@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    /**
     * Find bills by patient ID.
     */
    List<Bill> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    /**
     * Find bills by queue item ID.
     */
    List<Bill> findByQueueItemIdOrderByCreatedAtDesc(Long queueItemId);

    /**
     * Find bills by status.
     */
    Page<Bill> findByStatusOrderByCreatedAtDesc(BillStatus status, Pageable pageable);

    /**
     * Find bills by patient ID and status.
     */
    List<Bill> findByPatientIdAndStatusOrderByCreatedAtDesc(Long patientId, BillStatus status);

    /**
     * Find bills by bill number.
     */
    Optional<Bill> findByBillNumber(String billNumber);

    /**
     * Find overdue bills (bills with due date in the past and status not paid).
     */
    @Query("SELECT b FROM Bill b WHERE b.dueDate < :currentDate AND b.status NOT IN ('PAID', 'CANCELLED', 'REFUNDED')")
    List<Bill> findOverdueBills(@Param("currentDate") OffsetDateTime currentDate);

    /**
     * Find bills with balance due greater than zero.
     */
    @Query("SELECT b FROM Bill b WHERE b.balanceDue > 0")
    List<Bill> findBillsWithBalanceDue();

    /**
     * Calculate total amount for bills by patient.
     */
    @Query("SELECT SUM(b.totalAmount) FROM Bill b WHERE b.patientId = :patientId")
    Optional<java.math.BigDecimal> getTotalAmountByPatient(@Param("patientId") Long patientId);

    /**
     * Calculate total paid amount for bills by patient.
     */
    @Query("SELECT SUM(b.paidAmount) FROM Bill b WHERE b.patientId = :patientId")
    Optional<java.math.BigDecimal> getTotalPaidAmountByPatient(@Param("patientId") Long patientId);

    /**
     * Find bills created within a date range.
     */
    @Query("SELECT b FROM Bill b WHERE b.billingDate BETWEEN :startDate AND :endDate ORDER BY b.billingDate DESC")
    List<Bill> findBillsByDateRange(@Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    /**
     * Count bills by status.
     */
    long countByStatus(BillStatus status);

    /**
     * Find bills with total amount greater than specified amount.
     */
    @Query("SELECT b FROM Bill b WHERE b.totalAmount > :amount ORDER BY b.totalAmount DESC")
    List<Bill> findBillsWithAmountGreaterThan(@Param("amount") java.math.BigDecimal amount);
}
