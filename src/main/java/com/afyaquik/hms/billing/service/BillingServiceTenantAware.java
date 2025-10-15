package com.afyaquik.hms.billing.service;

import com.afyaquik.hms.billing.domain.Bill;
import com.afyaquik.hms.billing.domain.BillStatus;
import com.afyaquik.hms.billing.repository.BillRepositoryTenantAware;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Example service showing how to use tenant-aware repositories.
 * Notice how we don't need to pass tenantId explicitly anymore!
 */
@Service
@Transactional(readOnly = true)
public class BillingServiceTenantAware {

    private final BillRepositoryTenantAware billRepository;

    public BillingServiceTenantAware(BillRepositoryTenantAware billRepository) {
        this.billRepository = billRepository;
    }

    /**
     * Get all bills for the current tenant.
     * No need to pass tenantId - it's handled automatically!
     */
    public List<Bill> getAllBills() {
        return billRepository.findAllForCurrentTenant();
    }

    /**
     * Get bill by ID for the current tenant.
     * Automatically filtered by tenant context.
     */
    public Optional<Bill> getBillById(Long id) {
        return billRepository.findByIdForCurrentTenant(id);
    }

    /**
     * Get bills by patient ID for the current tenant.
     * Uses the tenant-aware method.
     */
    public List<Bill> getBillsByPatientId(Long patientId) {
        return billRepository.findByPatientIdForCurrentTenant(patientId);
    }

    /**
     * Get bills by queue item ID for the current tenant.
     * Uses the tenant-aware method.
     */
    public List<Bill> getBillsByQueueItemId(Long queueItemId) {
        return billRepository.findByQueueItemIdForCurrentTenant(queueItemId);
    }

    /**
     * Get bills by status for the current tenant.
     * Uses the tenant-aware method.
     */
    public Page<Bill> getBillsByStatus(BillStatus status, Pageable pageable) {
        return billRepository.findByStatusForCurrentTenant(status, pageable);
    }

    /**
     * Get bill by bill number for the current tenant.
     * Uses the tenant-aware method.
     */
    public Optional<Bill> getBillByBillNumber(String billNumber) {
        return billRepository.findByBillNumberForCurrentTenant(billNumber);
    }

    /**
     * Get overdue bills for the current tenant.
     * Uses the tenant-aware method.
     */
    public List<Bill> getOverdueBills(OffsetDateTime currentDate) {
        return billRepository.findOverdueBillsForCurrentTenant(currentDate);
    }

    /**
     * Get bills with balance due for the current tenant.
     * Uses the tenant-aware method.
     */
    public List<Bill> getBillsWithBalanceDue() {
        return billRepository.findBillsWithBalanceDueForCurrentTenant();
    }

    /**
     * Get total amount for a patient for the current tenant.
     * Uses the tenant-aware method.
     */
    public Optional<BigDecimal> getTotalAmountByPatient(Long patientId) {
        return billRepository.getTotalAmountByPatientForCurrentTenant(patientId);
    }

    /**
     * Get total paid amount for a patient for the current tenant.
     * Uses the tenant-aware method.
     */
    public Optional<BigDecimal> getTotalPaidAmountByPatient(Long patientId) {
        return billRepository.getTotalPaidAmountByPatientForCurrentTenant(patientId);
    }

    /**
     * Get bills by date range for the current tenant.
     * Uses the tenant-aware method.
     */
    public List<Bill> getBillsByDateRange(OffsetDateTime startDate, OffsetDateTime endDate) {
        return billRepository.findBillsByDateRangeForCurrentTenant(startDate, endDate);
    }

    /**
     * Count bills by status for the current tenant.
     * Uses the tenant-aware method.
     */
    public long countBillsByStatus(BillStatus status) {
        return billRepository.countByStatusForCurrentTenant(status);
    }

    /**
     * Get bills with amount greater than specified for the current tenant.
     * Uses the tenant-aware method.
     */
    public List<Bill> getBillsWithAmountGreaterThan(BigDecimal amount) {
        return billRepository.findBillsWithAmountGreaterThanForCurrentTenant(amount);
    }

    /**
     * Count all bills for the current tenant.
     * Automatically filtered by tenant context.
     */
    public long getBillCount() {
        return billRepository.countForCurrentTenant();
    }

    /**
     * Check if bill exists for the current tenant.
     * Automatically filtered by tenant context.
     */
    public boolean billExists(Long id) {
        return billRepository.existsByIdForCurrentTenant(id);
    }

    /**
     * Delete bill for the current tenant.
     * Automatically filtered by tenant context.
     */
    @Transactional
    public void deleteBill(Long id) {
        billRepository.deleteByIdForCurrentTenant(id);
    }

    /**
     * Delete all bills for the current tenant.
     * Automatically filtered by tenant context.
     */
    @Transactional
    public void deleteAllBills() {
        billRepository.deleteAllForCurrentTenant();
    }
}
