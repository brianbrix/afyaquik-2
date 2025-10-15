package com.afyaquik.hms.inventory.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.inventory.domain.ItemCategory;

@Repository
public interface ItemCategoryRepository extends TenantAwareRepository<ItemCategory, Long> {
    
    Optional<ItemCategory> findByTenantIdAndCategoryNameAndDeletedFalse(String tenantId, String categoryName);
    
    List<ItemCategory> findByTenantIdAndIsActiveTrueAndDeletedFalse(String tenantId);
    
    @Query("SELECT c FROM ItemCategory c WHERE c.tenantId = :tenantId AND c.categoryName LIKE %:searchTerm% AND c.deleted = false")
    List<ItemCategory> findByCategoryNameContaining(@Param("tenantId") String tenantId, @Param("searchTerm") String searchTerm);

    List<ItemCategory> findByTenantIdAndDeletedFalse(String tenantId);
}

