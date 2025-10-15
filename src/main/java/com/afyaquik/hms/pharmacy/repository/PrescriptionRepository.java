package com.afyaquik.hms.pharmacy.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.pharmacy.domain.Prescription;

@Repository
public interface PrescriptionRepository extends TenantAwareRepository<Prescription, Long> {

    @Query("SELECT p FROM Prescription p WHERE p.tenantId = :tenantId AND p.deleted = false")
    List<Prescription> findByTenantIdAndNotDeleted(@Param("tenantId") String tenantId);

    @Query("SELECT p FROM Prescription p WHERE p.tenantId = :tenantId AND p.deleted = false")
    Page<Prescription> findByTenantIdAndNotDeleted(@Param("tenantId") String tenantId, Pageable pageable);

    @Query("SELECT p FROM Prescription p WHERE p.tenantId = :tenantId AND p.prescriptionNumber = :prescriptionNumber AND p.deleted = false")
    Optional<Prescription> findByTenantIdAndPrescriptionNumber(@Param("tenantId") String tenantId, @Param("prescriptionNumber") String prescriptionNumber);

    @Query("SELECT p FROM Prescription p WHERE p.tenantId = :tenantId AND p.patient = :patient AND p.deleted = false")
    List<Prescription> findByTenantIdAndPatient(@Param("tenantId") String tenantId, @Param("patient") Patient patient);

    @Query("SELECT p FROM Prescription p WHERE p.tenantId = :tenantId AND p.patient.id = :patientId AND p.deleted = false")
    List<Prescription> findByTenantIdAndPatientId(@Param("tenantId") String tenantId, @Param("patientId") Long patientId);

    @Query("SELECT p FROM Prescription p WHERE p.tenantId = :tenantId AND p.patient.id = :patientId AND p.deleted = false")
    Page<Prescription> findByTenantIdAndPatientId(@Param("tenantId") String tenantId, @Param("patientId") Long patientId, Pageable pageable);

    @Query("SELECT p FROM Prescription p WHERE p.tenantId = :tenantId AND p.prescribedBy = :prescribedBy AND p.deleted = false")
    List<Prescription> findByTenantIdAndPrescribedBy(@Param("tenantId") String tenantId, @Param("prescribedBy") StaffUser prescribedBy);

    @Query("SELECT p FROM Prescription p WHERE p.tenantId = :tenantId AND p.prescribedBy.id = :prescribedById AND p.deleted = false")
    List<Prescription> findByTenantIdAndPrescribedById(@Param("tenantId") String tenantId, @Param("prescribedById") Long prescribedById);

    @Query("SELECT p FROM Prescription p WHERE p.tenantId = :tenantId AND p.status = :status AND p.deleted = false")
    List<Prescription> findByTenantIdAndStatus(@Param("tenantId") String tenantId, @Param("status") Prescription.PrescriptionStatus status);

    @Query("SELECT p FROM Prescription p WHERE p.tenantId = :tenantId AND p.status = :status AND p.deleted = false")
    Page<Prescription> findByTenantIdAndStatus(@Param("tenantId") String tenantId, @Param("status") Prescription.PrescriptionStatus status, Pageable pageable);

    @Query("SELECT p FROM Prescription p WHERE p.tenantId = :tenantId AND p.prescriptionDate BETWEEN :startDate AND :endDate AND p.deleted = false")
    List<Prescription> findByTenantIdAndPrescriptionDateBetween(@Param("tenantId") String tenantId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT p FROM Prescription p WHERE p.tenantId = :tenantId AND p.prescriptionDate BETWEEN :startDate AND :endDate AND p.deleted = false")
    Page<Prescription> findByTenantIdAndPrescriptionDateBetween(@Param("tenantId") String tenantId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT p FROM Prescription p WHERE p.tenantId = :tenantId AND " +
           "(LOWER(p.prescriptionNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.patient.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.patient.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.patient.medicalRecordNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "p.deleted = false")
    List<Prescription> searchByTenantId(@Param("tenantId") String tenantId, @Param("searchTerm") String searchTerm);

    @Query("SELECT p FROM Prescription p WHERE p.tenantId = :tenantId AND " +
           "(LOWER(p.prescriptionNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.patient.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.patient.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.patient.medicalRecordNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "p.deleted = false")
    Page<Prescription> searchByTenantId(@Param("tenantId") String tenantId, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Prescription p WHERE p.tenantId = :tenantId AND p.prescriptionNumber = :prescriptionNumber AND p.id != :excludeId AND p.deleted = false")
    long countByTenantIdAndPrescriptionNumberExcludingId(@Param("tenantId") String tenantId, @Param("prescriptionNumber") String prescriptionNumber, @Param("excludeId") Long excludeId);

    @Query("SELECT p FROM Prescription p WHERE p.tenantId = :tenantId AND p.dispensedBy = :dispensedBy AND p.deleted = false")
    List<Prescription> findByTenantIdAndDispensedBy(@Param("tenantId") String tenantId, @Param("dispensedBy") Long dispensedBy);

    @Query("SELECT p FROM Prescription p WHERE p.tenantId = :tenantId AND p.dispensedAt BETWEEN :startDate AND :endDate AND p.deleted = false")
    List<Prescription> findByTenantIdAndDispensedAtBetween(@Param("tenantId") String tenantId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Analytics methods
    long countByTenantIdAndDeletedFalse(String tenantId);
    long countByTenantIdAndCreatedAtBetweenAndDeletedFalse(String tenantId, LocalDateTime startDate, LocalDateTime endDate);
}

