package com.afyaquik.hms.queue.repository;

import com.afyaquik.hms.queue.domain.QueueTimelineEntry;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QueueTimelineEntryRepository extends JpaRepository<QueueTimelineEntry, Long> {

    List<QueueTimelineEntry> findByTenantIdAndQueueItem_IdOrderByCreatedAtAsc(String tenantId, Long queueItemId);
}
