package com.afyaquik.hms.triage.repository;

import com.afyaquik.hms.triage.domain.TriageItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TriageItemRepository extends JpaRepository<TriageItem, Long> {

    // Find active items by tenant
    List<TriageItem> findByTenantIdAndActiveTrueAndDeletedFalseOrderByDisplayOrderAsc(String tenantId);

    // Find items by category
    List<TriageItem> findByTenantIdAndCategoryAndActiveTrueAndDeletedFalseOrderByDisplayOrderAsc(String tenantId, String category);

    // Find items by data type
    List<TriageItem> findByTenantIdAndDataTypeAndActiveTrueAndDeletedFalseOrderByDisplayOrderAsc(String tenantId, TriageItem.TriageDataType dataType);

    // Find distinct categories
    @Query("SELECT DISTINCT t.category FROM TriageItem t WHERE t.tenantId = :tenantId AND t.active = true AND t.deleted = false ORDER BY t.category")
    List<String> findDistinctCategoriesByTenantId(@Param("tenantId") String tenantId);

    // Find distinct data types
    @Query("SELECT DISTINCT t.dataType FROM TriageItem t WHERE t.tenantId = :tenantId AND t.active = true AND t.deleted = false ORDER BY t.dataType")
    List<TriageItem.TriageDataType> findDistinctDataTypesByTenantId(@Param("tenantId") String tenantId);
    
    // Find by ID and tenant
    Optional<TriageItem> findByIdAndTenantId(Long id, String tenantId);
}