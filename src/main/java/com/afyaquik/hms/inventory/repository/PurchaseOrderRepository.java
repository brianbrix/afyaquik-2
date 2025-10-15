package com.afyaquik.hms.inventory.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.inventory.domain.PurchaseOrder;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends TenantAwareRepository<PurchaseOrder, Long> {
    
    Optional<PurchaseOrder> findByTenantIdAndOrderNumberAndDeletedFalse(String tenantId, String orderNumber);
    
    List<PurchaseOrder> findByTenantIdAndStatusAndDeletedFalse(String tenantId, PurchaseOrder.OrderStatus status);
    
    List<PurchaseOrder> findByTenantIdAndSupplierIdAndDeletedFalse(String tenantId, Long supplierId);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.tenantId = :tenantId AND po.orderDate BETWEEN :startDate AND :endDate AND po.deleted = false")
    List<PurchaseOrder> findByOrderDateBetween(@Param("tenantId") String tenantId, 
                                               @Param("startDate") LocalDate startDate, 
                                               @Param("endDate") LocalDate endDate);
    
    @Query("SELECT po FROM PurchaseOrder po WHERE po.tenantId = :tenantId AND po.orderNumber LIKE %:searchTerm% AND po.deleted = false")
    List<PurchaseOrder> findByOrderNumberContaining(@Param("tenantId") String tenantId, @Param("searchTerm") String searchTerm);
}

