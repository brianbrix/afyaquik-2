package com.afyaquik.hms.inventory.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.inventory.domain.InventoryItem;

@Repository
public interface InventoryItemRepository extends TenantAwareRepository<InventoryItem, Long> {
    
    Optional<InventoryItem> findByTenantIdAndItemCodeAndDeletedFalse(String tenantId, String itemCode);
    
    List<InventoryItem> findByTenantIdAndIsActiveTrueAndDeletedFalse(String tenantId);
    
    List<InventoryItem> findByTenantIdAndCategoryIdAndDeletedFalse(String tenantId, Long categoryId);
    
    List<InventoryItem> findByTenantIdAndSupplierIdAndDeletedFalse(String tenantId, Long supplierId);
    
    List<InventoryItem> findByTenantIdAndDepartmentIdAndDeletedFalse(String tenantId, Long departmentId);
    
    @Query("SELECT i FROM InventoryItem i WHERE i.tenantId = :tenantId AND i.currentStock <= i.minimumStockLevel AND i.deleted = false")
    List<InventoryItem> findLowStockItems(@Param("tenantId") String tenantId);
    
    @Query("SELECT i FROM InventoryItem i WHERE i.tenantId = :tenantId AND i.currentStock >= i.maximumStockLevel AND i.deleted = false")
    List<InventoryItem> findOverstockedItems(@Param("tenantId") String tenantId);
    
    @Query("SELECT i FROM InventoryItem i WHERE i.tenantId = :tenantId AND i.itemName LIKE %:searchTerm% AND i.deleted = false")
    List<InventoryItem> findByItemNameContaining(@Param("tenantId") String tenantId, @Param("searchTerm") String searchTerm);
    
    @Query("SELECT i FROM InventoryItem i WHERE i.tenantId = :tenantId AND i.itemCode LIKE %:searchTerm% AND i.deleted = false")
    List<InventoryItem> findByItemCodeContaining(@Param("tenantId") String tenantId, @Param("searchTerm") String searchTerm);
    
    @Query("SELECT i FROM InventoryItem i WHERE i.tenantId = :tenantId AND i.barcode = :barcode AND i.deleted = false")
    Optional<InventoryItem> findByBarcode(@Param("tenantId") String tenantId, @Param("barcode") String barcode);

    List<InventoryItem> findByTenantIdAndDeletedFalse(String tenantId);
}

