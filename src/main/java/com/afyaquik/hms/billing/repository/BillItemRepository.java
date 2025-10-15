package com.afyaquik.hms.billing.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.billing.domain.BillItem;

@Repository
public interface BillItemRepository extends JpaRepository<BillItem, Long> {
    
    /**
     * Find all bill items for a specific bill in a tenant.
     */
    @Query("SELECT bi FROM BillItem bi WHERE bi.tenantId = :tenantId AND bi.bill.id = :billId AND bi.deleted = false ORDER BY bi.createdAt ASC")
    List<BillItem> findByTenantIdAndBillId(@Param("tenantId") String tenantId, @Param("billId") Long billId);
    
    /**
     * Find all bill items for a specific bill (without tenant filter).
     */
    List<BillItem> findByBillIdAndDeletedFalseOrderByCreatedAtAsc(Long billId);
}
