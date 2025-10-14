package com.afyaquik.hms.queue.repository;

import com.afyaquik.hms.queue.domain.TriageEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TriageEntryRepository extends JpaRepository<TriageEntry, Long> {
    List<TriageEntry> findByQueueItemId(Long queueItemId);
    void deleteByQueueItemId(Long queueItemId);
}
