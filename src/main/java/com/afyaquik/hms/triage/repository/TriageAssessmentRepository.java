package com.afyaquik.hms.triage.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.triage.domain.TriageAssessment;
import com.afyaquik.hms.triage.domain.TriageItem;

@Repository
public interface TriageAssessmentRepository extends JpaRepository<TriageAssessment, Long> {

    // Find by patient
    List<TriageAssessment> findByPatientOrderByTriageTimestampDesc(Patient patient);

    // Find by patient and tenant
    List<TriageAssessment> findByPatientAndTenantIdOrderByTriageTimestampDesc(Patient patient, String tenantId);

    // Find by triage item
    List<TriageAssessment> findByTriageItemOrderByTriageTimestampDesc(TriageItem triageItem);

    // Find by staff
    List<TriageAssessment> findByStaffOrderByTriageTimestampDesc(StaffUser staff);

    // Find by patient and triage item
    List<TriageAssessment> findByPatientAndTriageItemOrderByTriageTimestampDesc(Patient patient, TriageItem triageItem);

    // Find latest assessment for patient and triage item
    Optional<TriageAssessment> findFirstByPatientAndTriageItemOrderByTriageTimestampDesc(Patient patient, TriageItem triageItem);

    // Find by date range
    List<TriageAssessment> findByTenantIdAndTriageTimestampBetweenOrderByTriageTimestampDesc(String tenantId, LocalDateTime startDate, LocalDateTime endDate);

    // Find by patient and date range
    List<TriageAssessment> findByPatientAndTriageTimestampBetweenOrderByTriageTimestampDesc(Patient patient, LocalDateTime startDate, LocalDateTime endDate);

    // Find abnormal assessments
    List<TriageAssessment> findByTenantIdAndIsAbnormalTrueOrderByTriageTimestampDesc(String tenantId);

    // Find critical assessments
    List<TriageAssessment> findByTenantIdAndIsCriticalTrueOrderByTriageTimestampDesc(String tenantId);

    // Find warning assessments
    List<TriageAssessment> findByTenantIdAndIsWarningTrueOrderByTriageTimestampDesc(String tenantId);

    // Find by queue item
    List<TriageAssessment> findByQueueItemIdOrderByTriageTimestampDesc(Long queueItemId);

    // Count by patient
    long countByPatientAndDeletedFalse(Patient patient);

    // Count by triage item
    long countByTriageItemAndDeletedFalse(TriageItem triageItem);

    // Count by staff
    long countByStaffAndDeletedFalse(StaffUser staff);

    // Count abnormal assessments by patient
    long countByPatientAndIsAbnormalTrueAndDeletedFalse(Patient patient);

    // Count critical assessments by patient
    long countByPatientAndIsCriticalTrueAndDeletedFalse(Patient patient);

    // Find assessments needing review
    @Query("SELECT t FROM TriageAssessment t WHERE t.tenantId = :tenantId AND (t.isAbnormal = true OR t.isCritical = true OR t.isWarning = true) AND t.deleted = false ORDER BY t.triageTimestamp DESC")
    List<TriageAssessment> findAssessmentsNeedingReview(@Param("tenantId") String tenantId);

    // Find assessments by status
    @Query("SELECT t FROM TriageAssessment t WHERE t.tenantId = :tenantId AND t.isNormal = :isNormal AND t.deleted = false ORDER BY t.triageTimestamp DESC")
    List<TriageAssessment> findByTenantIdAndIsNormal(@Param("tenantId") String tenantId, @Param("isNormal") Boolean isNormal);

    // Find assessments with calculations
    @Query("SELECT t FROM TriageAssessment t WHERE t.tenantId = :tenantId AND t.calculatedResult IS NOT NULL AND t.deleted = false ORDER BY t.triageTimestamp DESC")
    List<TriageAssessment> findAssessmentsWithCalculations(@Param("tenantId") String tenantId);

    // Get latest assessments for patient
    @Query("SELECT t FROM TriageAssessment t WHERE t.patient = :patient AND t.deleted = false ORDER BY t.triageTimestamp DESC")
    List<TriageAssessment> findLatestAssessmentsForPatient(@Param("patient") Patient patient);

    // Find assessments by category
    @Query("SELECT t FROM TriageAssessment t WHERE t.tenantId = :tenantId AND t.triageItem.category = :category AND t.deleted = false ORDER BY t.triageTimestamp DESC")
    List<TriageAssessment> findByTenantIdAndCategory(@Param("tenantId") String tenantId, @Param("category") String category);

    // Find assessments by data type
    @Query("SELECT t FROM TriageAssessment t WHERE t.tenantId = :tenantId AND t.triageItem.dataType = :dataType AND t.deleted = false ORDER BY t.triageTimestamp DESC")
    List<TriageAssessment> findByTenantIdAndDataType(@Param("tenantId") String tenantId, @Param("dataType") TriageItem.TriageDataType dataType);

    // Find by patient ID
    List<TriageAssessment> findByPatientIdAndDeletedFalse(Long patientId);

    // Find by ID and tenant
    Optional<TriageAssessment> findByIdAndTenantId(Long id, String tenantId);
}
