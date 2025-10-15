package com.afyaquik.hms.queue.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import com.afyaquik.hms.queue.domain.QueueTimelineEntry;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QueueTimelineEntryRepository extends TenantAwareRepository<QueueTimelineEntry, Long> {

    List<QueueTimelineEntry> findByTenantIdAndQueueItem_IdOrderByCreatedAtAsc(String tenantId, Long queueItemId);
}
