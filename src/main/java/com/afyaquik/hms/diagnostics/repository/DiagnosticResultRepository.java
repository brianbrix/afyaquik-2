package com.afyaquik.hms.diagnostics.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.diagnostics.domain.DiagnosticResult;
import com.afyaquik.hms.diagnostics.domain.ResultStatus;

@Repository
public interface DiagnosticResultRepository extends JpaRepository<DiagnosticResult, Long> {
    
    List<DiagnosticResult> findByDiagnosticOrderIdOrderByPerformedAtDesc(Long diagnosticOrderId);
    
    List<DiagnosticResult> findByDiagnosticItemIdOrderByPerformedAtDesc(Long diagnosticItemId);
    
    List<DiagnosticResult> findByStatusOrderByPerformedAtDesc(ResultStatus status);
    
    @Query("SELECT r FROM DiagnosticResult r WHERE r.diagnosticOrder.patientId = :patientId ORDER BY r.performedAt DESC")
    List<DiagnosticResult> findByPatientIdOrderByPerformedAtDesc(@Param("patientId") Long patientId);
    
    @Query("SELECT r FROM DiagnosticResult r WHERE r.diagnosticOrder.queueItemId = :queueItemId ORDER BY r.performedAt DESC")
    List<DiagnosticResult> findByQueueItemIdOrderByPerformedAtDesc(@Param("queueItemId") Long queueItemId);
    
    @Query("SELECT r FROM DiagnosticResult r WHERE r.diagnosticOrder.patientId = :patientId AND r.status = :status ORDER BY r.performedAt DESC")
    List<DiagnosticResult> findByPatientIdAndStatusOrderByPerformedAtDesc(@Param("patientId") Long patientId, @Param("status") ResultStatus status);
}
