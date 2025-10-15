package com.afyaquik.hms.queue.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.queue.domain.QueueStatus;
import com.afyaquik.hms.queue.domain.VisitQueueItem;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface VisitQueueItemRepository extends TenantAwareRepository<VisitQueueItem, Long> {

    List<VisitQueueItem> findByTenantIdAndCurrentStatusOrderByCreatedAtAsc(String tenantId, QueueStatus status);

    List<VisitQueueItem> findByTenantIdAndCurrentStatusAndCreatedAtBetweenOrderByCreatedAtAsc(
        String tenantId, QueueStatus status, java.time.Instant startDate, java.time.Instant endDate);

    long countByTenantIdAndCurrentStatus(String tenantId, QueueStatus status);

    // Added for demo data seeding to quickly determine if any queue items exist for a tenant
    long countByTenantId(String tenantId);

    Optional<VisitQueueItem> findFirstByTenantIdAndPatientIdOrderByCreatedAtDesc(String tenantId, Long patientId);
    List<VisitQueueItem> findByTenantIdAndCurrentStatusAndCurrentAssigneeIdOrderByCreatedAtAsc(String tenantId, QueueStatus status, String currentAssigneeId);

    List<VisitQueueItem> findByTenantIdAndCurrentStatusAndCurrentAssigneeIdAndCreatedAtBetweenOrderByCreatedAtAsc(
        String tenantId, QueueStatus status, String currentAssigneeId, java.time.Instant startDate, java.time.Instant endDate);

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
