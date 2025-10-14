package com.afyaquik.hms.consultation.repository;

import com.afyaquik.hms.consultation.domain.ConsultationEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConsultationEntryRepository extends JpaRepository<ConsultationEntry, Long> {
    List<ConsultationEntry> findByQueueItemId(Long queueItemId);
}
