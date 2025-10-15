package com.afyaquik.hms.diagnostics.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.diagnostics.domain.DiagnosticOrder;
import com.afyaquik.hms.diagnostics.domain.DiagnosticOrderStatus;

@Repository
public interface DiagnosticOrderRepository extends TenantAwareRepository<DiagnosticOrder, Long> {
    
    Optional<DiagnosticOrder> findByOrderNumber(String orderNumber);
    
    List<DiagnosticOrder> findByPatientIdOrderByOrderedAtDesc(Long patientId);
    
    List<DiagnosticOrder> findByQueueItemIdOrderByOrderedAtDesc(Long queueItemId);
    
    List<DiagnosticOrder> findByStatusOrderByOrderedAtDesc(DiagnosticOrderStatus status);
    
    @Query("SELECT d FROM DiagnosticOrder d WHERE d.patientId = :patientId AND d.status IN :statuses ORDER BY d.orderedAt DESC")
    List<DiagnosticOrder> findByPatientIdAndStatusInOrderByOrderedAtDesc(@Param("patientId") Long patientId, @Param("statuses") List<DiagnosticOrderStatus> statuses);
    
    @Query("SELECT d FROM DiagnosticOrder d WHERE d.queueItemId = :queueItemId AND d.status IN :statuses ORDER BY d.orderedAt DESC")
    List<DiagnosticOrder> findByQueueItemIdAndStatusInOrderByOrderedAtDesc(@Param("queueItemId") Long queueItemId, @Param("statuses") List<DiagnosticOrderStatus> statuses);
    
    @Query("SELECT COUNT(d) FROM DiagnosticOrder d WHERE d.patientId = :patientId AND d.status = :status")
    long countByPatientIdAndStatus(@Param("patientId") Long patientId, @Param("status") DiagnosticOrderStatus status);
    
    // Tenant-aware default methods
    default Optional<DiagnosticOrder> findByOrderNumberForCurrentTenant(String orderNumber) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndOrderNumber(tenantId, orderNumber);
    }
    
    default List<DiagnosticOrder> findByPatientIdForCurrentTenant(Long patientId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndPatientIdOrderByOrderedAtDesc(tenantId, patientId);
    }
    
    default List<DiagnosticOrder> findByQueueItemIdForCurrentTenant(Long queueItemId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndQueueItemIdOrderByOrderedAtDesc(tenantId, queueItemId);
    }
    
    default List<DiagnosticOrder> findByStatusForCurrentTenant(DiagnosticOrderStatus status) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndStatusOrderByOrderedAtDesc(tenantId, status);
    }
    
    default List<DiagnosticOrder> findByPatientIdAndStatusInForCurrentTenant(Long patientId, List<DiagnosticOrderStatus> statuses) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndPatientIdAndStatusInOrderByOrderedAtDesc(tenantId, patientId, statuses);
    }
    
    default List<DiagnosticOrder> findByQueueItemIdAndStatusInForCurrentTenant(Long queueItemId, List<DiagnosticOrderStatus> statuses) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndQueueItemIdAndStatusInOrderByOrderedAtDesc(tenantId, queueItemId, statuses);
    }
    
    default long countByPatientIdAndStatusForCurrentTenant(Long patientId, DiagnosticOrderStatus status) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return countByTenantIdAndPatientIdAndStatus(tenantId, patientId, status);
    }
    
    // Keep existing tenant-aware methods (actual implementations)
    Optional<DiagnosticOrder> findByTenantIdAndOrderNumber(String tenantId, String orderNumber);
    List<DiagnosticOrder> findByTenantIdAndPatientIdOrderByOrderedAtDesc(String tenantId, Long patientId);
    List<DiagnosticOrder> findByTenantIdAndQueueItemIdOrderByOrderedAtDesc(String tenantId, Long queueItemId);
    List<DiagnosticOrder> findByTenantIdAndStatusOrderByOrderedAtDesc(String tenantId, DiagnosticOrderStatus status);
    
    @Query("SELECT d FROM DiagnosticOrder d WHERE d.tenantId = :tenantId AND d.patientId = :patientId AND d.status IN :statuses ORDER BY d.orderedAt DESC")
    List<DiagnosticOrder> findByTenantIdAndPatientIdAndStatusInOrderByOrderedAtDesc(@Param("tenantId") String tenantId, @Param("patientId") Long patientId, @Param("statuses") List<DiagnosticOrderStatus> statuses);
    
    @Query("SELECT d FROM DiagnosticOrder d WHERE d.tenantId = :tenantId AND d.queueItemId = :queueItemId AND d.status IN :statuses ORDER BY d.orderedAt DESC")
    List<DiagnosticOrder> findByTenantIdAndQueueItemIdAndStatusInOrderByOrderedAtDesc(@Param("tenantId") String tenantId, @Param("queueItemId") Long queueItemId, @Param("statuses") List<DiagnosticOrderStatus> statuses);
    
    @Query("SELECT COUNT(d) FROM DiagnosticOrder d WHERE d.tenantId = :tenantId AND d.patientId = :patientId AND d.status = :status")
    long countByTenantIdAndPatientIdAndStatus(@Param("tenantId") String tenantId, @Param("patientId") Long patientId, @Param("status") DiagnosticOrderStatus status);

    // Dashboard methods
    long countForCurrentTenant();
    long countByTenantIdAndStatus(String tenantId, DiagnosticOrderStatus status);
    default long countByStatusForCurrentTenant(DiagnosticOrderStatus status) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return countByTenantIdAndStatus(tenantId, status);
    }
    
    // Analytics methods
    long countByTenantIdAndDeletedFalse(String tenantId);
    long countByTenantIdAndCreatedAtBetweenAndDeletedFalse(String tenantId, LocalDateTime startDate, LocalDateTime endDate);
}
