package com.afyaquik.hms.consultation.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import com.afyaquik.hms.consultation.domain.ConsultationEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConsultationEntryRepository extends TenantAwareRepository<ConsultationEntry, Long> {
    List<ConsultationEntry> findByQueueItemId(Long queueItemId);
}
