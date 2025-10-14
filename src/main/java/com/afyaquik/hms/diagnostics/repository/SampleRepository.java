package com.afyaquik.hms.diagnostics.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.diagnostics.domain.Sample;
import com.afyaquik.hms.diagnostics.domain.SampleStatus;

@Repository
public interface SampleRepository extends JpaRepository<Sample, Long> {
    
    Optional<Sample> findByBarcode(String barcode);
    
    List<Sample> findByDiagnosticOrderIdOrderByCollectedAtDesc(Long diagnosticOrderId);
    
    List<Sample> findByDiagnosticItemIdOrderByCollectedAtDesc(Long diagnosticItemId);
    
    List<Sample> findByStatusOrderByCollectedAtDesc(SampleStatus status);
    
    @Query("SELECT s FROM Sample s WHERE s.diagnosticOrder.patientId = :patientId ORDER BY s.collectedAt DESC")
    List<Sample> findByPatientIdOrderByCollectedAtDesc(@Param("patientId") Long patientId);
    
    @Query("SELECT s FROM Sample s WHERE s.diagnosticOrder.queueItemId = :queueItemId ORDER BY s.collectedAt DESC")
    List<Sample> findByQueueItemIdOrderByCollectedAtDesc(@Param("queueItemId") Long queueItemId);
}
