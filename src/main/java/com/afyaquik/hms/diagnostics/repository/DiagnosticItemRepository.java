package com.afyaquik.hms.diagnostics.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.diagnostics.domain.DiagnosticItem;
import com.afyaquik.hms.diagnostics.domain.DiagnosticItemStatus;

@Repository
public interface DiagnosticItemRepository extends JpaRepository<DiagnosticItem, Long> {
    
    List<DiagnosticItem> findByDiagnosticOrderIdOrderByCreatedAtDesc(Long diagnosticOrderId);
    
    List<DiagnosticItem> findByStatusOrderByCreatedAtDesc(DiagnosticItemStatus status);
    
    @Query("SELECT di FROM DiagnosticItem di WHERE di.diagnosticOrder.patientId = :patientId ORDER BY di.createdAt DESC")
    List<DiagnosticItem> findByPatientIdOrderByCreatedAtDesc(@Param("patientId") Long patientId);
    
    @Query("SELECT di FROM DiagnosticItem di WHERE di.diagnosticOrder.queueItemId = :queueItemId ORDER BY di.createdAt DESC")
    List<DiagnosticItem> findByQueueItemIdOrderByCreatedAtDesc(@Param("queueItemId") Long queueItemId);
}
