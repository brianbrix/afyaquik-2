package com.afyaquik.hms.queue.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
}
