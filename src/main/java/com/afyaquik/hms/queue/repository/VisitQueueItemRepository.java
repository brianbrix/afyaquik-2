package com.afyaquik.hms.queue.repository;

import com.afyaquik.hms.queue.domain.QueueStatus;
import com.afyaquik.hms.queue.domain.VisitQueueItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VisitQueueItemRepository extends JpaRepository<VisitQueueItem, Long> {

    List<VisitQueueItem> findByTenantIdAndCurrentStatusOrderByCreatedAtAsc(String tenantId, QueueStatus status);

    long countByTenantIdAndCurrentStatus(String tenantId, QueueStatus status);

    Optional<VisitQueueItem> findFirstByTenantIdAndPatientIdOrderByCreatedAtDesc(String tenantId, Long patientId);
}
