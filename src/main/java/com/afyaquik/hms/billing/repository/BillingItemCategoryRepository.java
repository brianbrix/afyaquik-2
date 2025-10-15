package com.afyaquik.hms.billing.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.billing.domain.BillingItemCategory;

@Repository
public interface BillingItemCategoryRepository extends JpaRepository<BillingItemCategory, Long> {
    
    /**
     * Find all active billing item categories for a tenant.
     */
    @Query("SELECT bic FROM BillingItemCategory bic WHERE bic.tenantId = :tenantId AND bic.deleted = false ORDER BY bic.categoryName")
    List<BillingItemCategory> findByTenantIdAndDeletedFalseOrderByCategoryNameAsc(@Param("tenantId") String tenantId);
    
    /**
     * Find billing item category by category name in a tenant.
     */
    @Query("SELECT bic FROM BillingItemCategory bic WHERE bic.tenantId = :tenantId AND bic.categoryName = :categoryName AND bic.deleted = false")
    Optional<BillingItemCategory> findByTenantIdAndCategoryNameAndDeletedFalse(@Param("tenantId") String tenantId, @Param("categoryName") String categoryName);
    
    /**
     * Find active billing item categories for a tenant.
     */
    @Query("SELECT bic FROM BillingItemCategory bic WHERE bic.tenantId = :tenantId AND bic.isActive = true AND bic.deleted = false ORDER BY bic.categoryName")
    List<BillingItemCategory> findByTenantIdAndIsActiveTrueAndDeletedFalseOrderByCategoryNameAsc(@Param("tenantId") String tenantId);
}
