package com.afyaquik.hms.billing.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.billing.domain.BillingItem;

@Repository
public interface BillingItemRepository extends JpaRepository<BillingItem, Long> {
    
    /**
     * Find all active billing items for a tenant.
     */
    @Query("SELECT bi FROM BillingItem bi WHERE bi.tenantId = :tenantId AND bi.deleted = false ORDER BY bi.serviceCategory, bi.description")
    List<BillingItem> findByTenantIdAndDeletedFalseOrderByServiceCategoryAscDescriptionAsc(@Param("tenantId") String tenantId);
    
    /**
     * Find billing item by item code in a tenant.
     */
    @Query("SELECT bi FROM BillingItem bi WHERE bi.tenantId = :tenantId AND bi.itemCode = :itemCode AND bi.deleted = false")
    Optional<BillingItem> findByTenantIdAndItemCodeAndDeletedFalse(@Param("tenantId") String tenantId, @Param("itemCode") String itemCode);
    
    /**
     * Find billing items by service category in a tenant.
     */
    @Query("SELECT bi FROM BillingItem bi WHERE bi.tenantId = :tenantId AND bi.serviceCategory = :serviceCategory AND bi.deleted = false ORDER BY bi.description")
    List<BillingItem> findByTenantIdAndServiceCategoryAndDeletedFalseOrderByDescriptionAsc(@Param("tenantId") String tenantId, @Param("serviceCategory") String serviceCategory);
    
    /**
     * Find active billing items by service category in a tenant.
     */
    @Query("SELECT bi FROM BillingItem bi WHERE bi.tenantId = :tenantId AND bi.serviceCategory = :serviceCategory AND bi.isActive = true AND bi.deleted = false ORDER BY bi.description")
    List<BillingItem> findByTenantIdAndServiceCategoryAndIsActiveTrueAndDeletedFalseOrderByDescriptionAsc(@Param("tenantId") String tenantId, @Param("serviceCategory") String serviceCategory);
}
