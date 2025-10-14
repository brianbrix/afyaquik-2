package com.afyaquik.hms.diagnostics.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.diagnostics.domain.DiagnosticOrder;
import com.afyaquik.hms.diagnostics.domain.DiagnosticOrderStatus;

@Repository
public interface DiagnosticOrderRepository extends JpaRepository<DiagnosticOrder, Long> {
    
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
}
