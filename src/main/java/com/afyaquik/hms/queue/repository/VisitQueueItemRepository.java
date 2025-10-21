package com.afyaquik.hms.queue.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.queue.domain.QueueStatus;
import com.afyaquik.hms.queue.domain.VisitQueueItem;

@Repository
public interface VisitQueueItemRepository extends TenantAwareRepository<VisitQueueItem, Long> {

    List<VisitQueueItem> findByTenantIdAndCurrentStatusOrderByCreatedAtAsc(String tenantId, QueueStatus status);
    Page<VisitQueueItem> findByTenantIdAndCurrentStatusOrderByCreatedAtAsc(String tenantId, QueueStatus status, Pageable pageable);

    List<VisitQueueItem> findByTenantIdAndCurrentStatusAndCreatedAtBetweenOrderByCreatedAtAsc(
        String tenantId, QueueStatus status, java.time.Instant startDate, java.time.Instant endDate);
    Page<VisitQueueItem> findByTenantIdAndCurrentStatusAndCreatedAtBetweenOrderByCreatedAtAsc(
        String tenantId, QueueStatus status, java.time.Instant startDate, java.time.Instant endDate, Pageable pageable);

    long countByTenantIdAndCurrentStatus(String tenantId, QueueStatus status);

    // Added for demo data seeding to quickly determine if any queue items exist for a tenant
    long countByTenantId(String tenantId);

    Optional<VisitQueueItem> findFirstByTenantIdAndPatientIdOrderByCreatedAtDesc(String tenantId, Long patientId);
    List<VisitQueueItem> findByTenantIdAndCurrentStatusAndCurrentAssigneeIdOrderByCreatedAtAsc(String tenantId, QueueStatus status, String currentAssigneeId);
    Page<VisitQueueItem> findByTenantIdAndCurrentStatusAndCurrentAssigneeIdOrderByCreatedAtAsc(String tenantId, QueueStatus status, String currentAssigneeId, Pageable pageable);

    List<VisitQueueItem> findByTenantIdAndCurrentStatusAndCurrentAssigneeIdAndCreatedAtBetweenOrderByCreatedAtAsc(
        String tenantId, QueueStatus status, String currentAssigneeId, java.time.Instant startDate, java.time.Instant endDate);
    Page<VisitQueueItem> findByTenantIdAndCurrentStatusAndCurrentAssigneeIdAndCreatedAtBetweenOrderByCreatedAtAsc(
        String tenantId, QueueStatus status, String currentAssigneeId, java.time.Instant startDate, java.time.Instant endDate, Pageable pageable);

    // Returns true if a PENDING_CHECKIN exists for this patient today
    boolean existsByTenantIdAndPatient_IdAndCurrentStatusAndCreatedAtBetween(
    String tenantId, Long patientId, QueueStatus status, java.time.Instant start, java.time.Instant end);

    // Dashboard statistics methods
    long countByTenantIdAndCurrentAssigneeId(String tenantId, String currentAssigneeId);
    long countByTenantIdAndCurrentAssigneeIdAndCurrentStatus(String tenantId, String currentAssigneeId, QueueStatus status);
    long countByTenantIdAndCurrentAssigneeIdAndCurrentStatusIn(String tenantId, String currentAssigneeId, QueueStatus... statuses);
    
    // Analytics methods
    long countByTenantIdAndDeletedFalse(String tenantId);
    long countByTenantIdAndCreatedAtBetweenAndDeletedFalse(String tenantId, LocalDateTime startDate, LocalDateTime endDate);
    
    // Find queue items by tenant and date range for snapshots
    List<VisitQueueItem> findByTenantIdAndCreatedAtBetweenOrderByCreatedAtAsc(
        String tenantId, java.time.Instant startDate, java.time.Instant endDate);
    
    // Find queue items by tenant and date range (last 7 days) for snapshots
    @Query("SELECT q FROM VisitQueueItem q WHERE q.tenantId = :tenantId " +
           "AND q.createdAt >= :startDate " +
           "AND q.deleted = false " +
           "ORDER BY q.createdAt ASC")
    List<VisitQueueItem> findRecentQueueItemsForSnapshot(@Param("tenantId") String tenantId, @Param("startDate") java.time.Instant startDate);

    // Find queue items that have been waiting for notification (30+ minutes in waiting status)
    @Query("SELECT q FROM VisitQueueItem q WHERE q.tenantId = :tenantId " +
           "AND q.currentStatus IN ('WAITING_TRIAGE', 'WAITING_PROVIDER', 'WAITING_DIAGNOSTICS', 'WAITING_PHARMACY', 'WAITING_BILLING') " +
           "AND (q.updatedAt IS NOT NULL AND q.updatedAt <= :thresholdTime OR " +
           "q.updatedAt IS NULL AND q.createdAt <= :thresholdTime) " +
           "AND q.currentAssigneeId IS NOT NULL " +
           "AND q.deleted = false")
    List<VisitQueueItem> findWaitingItemsForNotification(@Param("tenantId") String tenantId, @Param("thresholdTime") java.time.Instant thresholdTime);
}
