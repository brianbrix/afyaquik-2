package com.afyaquik.hms.pharmacy.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.pharmacy.domain.Medication;

@Repository
public interface MedicationRepository extends TenantAwareRepository<Medication, Long> {

    @Query("SELECT m FROM Medication m WHERE m.tenantId = :tenantId AND m.deleted = false")
    List<Medication> findByTenantIdAndNotDeleted(@Param("tenantId") String tenantId);

    @Query("SELECT m FROM Medication m WHERE m.tenantId = :tenantId AND m.deleted = false")
    Page<Medication> findByTenantIdAndNotDeleted(@Param("tenantId") String tenantId, Pageable pageable);

    @Query("SELECT m FROM Medication m WHERE m.tenantId = :tenantId AND m.medicationCode = :medicationCode AND m.deleted = false")
    Optional<Medication> findByTenantIdAndMedicationCode(@Param("tenantId") String tenantId, @Param("medicationCode") String medicationCode);

    @Query("SELECT m FROM Medication m WHERE m.tenantId = :tenantId AND m.active = true AND m.deleted = false")
    List<Medication> findActiveByTenantId(@Param("tenantId") String tenantId);

    @Query("SELECT m FROM Medication m WHERE m.tenantId = :tenantId AND m.active = true AND m.deleted = false")
    Page<Medication> findActiveByTenantId(@Param("tenantId") String tenantId, Pageable pageable);

    @Query("SELECT m FROM Medication m WHERE m.tenantId = :tenantId AND " +
           "(LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.genericName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.medicationCode) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "m.deleted = false")
    List<Medication> searchByTenantId(@Param("tenantId") String tenantId, @Param("searchTerm") String searchTerm);

    @Query("SELECT m FROM Medication m WHERE m.tenantId = :tenantId AND " +
           "(LOWER(m.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.genericName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(m.medicationCode) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "m.deleted = false")
    Page<Medication> searchByTenantId(@Param("tenantId") String tenantId, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT m FROM Medication m WHERE m.tenantId = :tenantId AND m.controlledSubstance = true AND m.deleted = false")
    List<Medication> findControlledSubstancesByTenantId(@Param("tenantId") String tenantId);

    @Query("SELECT m FROM Medication m WHERE m.tenantId = :tenantId AND m.requiresPrescription = :requiresPrescription AND m.deleted = false")
    List<Medication> findByTenantIdAndRequiresPrescription(@Param("tenantId") String tenantId, @Param("requiresPrescription") boolean requiresPrescription);

    @Query("SELECT COUNT(m) FROM Medication m WHERE m.tenantId = :tenantId AND m.medicationCode = :medicationCode AND m.id != :excludeId AND m.deleted = false")
    long countByTenantIdAndMedicationCodeExcludingId(@Param("tenantId") String tenantId, @Param("medicationCode") String medicationCode, @Param("excludeId") Long excludeId);
}

