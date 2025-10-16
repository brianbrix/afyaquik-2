package com.afyaquik.hms.pharmacy.repository;

import com.afyaquik.hms.pharmacy.domain.PharmacyAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PharmacyActionRepository extends JpaRepository<PharmacyAction, Long> {
    List<PharmacyAction> findByQueueItemIdOrderBySortOrderAsc(Long queueItemId);
    List<PharmacyAction> findByQueueItemIdAndTenantIdOrderBySortOrderAsc(Long queueItemId, String tenantId);
    void deleteByQueueItemId(Long queueItemId);
}
