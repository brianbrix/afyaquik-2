package com.afyaquik.hms.pharmacy.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.pharmacy.domain.Medication;
import com.afyaquik.hms.pharmacy.domain.Prescription;
import com.afyaquik.hms.pharmacy.domain.PrescriptionItem;

@Repository
public interface PrescriptionItemRepository extends TenantAwareRepository<PrescriptionItem, Long> {

    @Query("SELECT pi FROM PrescriptionItem pi WHERE pi.tenantId = :tenantId AND pi.deleted = false")
    List<PrescriptionItem> findByTenantIdAndNotDeleted(@Param("tenantId") String tenantId);

    @Query("SELECT pi FROM PrescriptionItem pi WHERE pi.tenantId = :tenantId AND pi.prescription = :prescription AND pi.deleted = false")
    List<PrescriptionItem> findByTenantIdAndPrescription(@Param("tenantId") String tenantId, @Param("prescription") Prescription prescription);

    @Query("SELECT pi FROM PrescriptionItem pi WHERE pi.tenantId = :tenantId AND pi.prescription.id = :prescriptionId AND pi.deleted = false")
    List<PrescriptionItem> findByTenantIdAndPrescriptionId(@Param("tenantId") String tenantId, @Param("prescriptionId") Long prescriptionId);

    @Query("SELECT pi FROM PrescriptionItem pi WHERE pi.tenantId = :tenantId AND pi.medication = :medication AND pi.deleted = false")
    List<PrescriptionItem> findByTenantIdAndMedication(@Param("tenantId") String tenantId, @Param("medication") Medication medication);

    @Query("SELECT pi FROM PrescriptionItem pi WHERE pi.tenantId = :tenantId AND pi.medication.id = :medicationId AND pi.deleted = false")
    List<PrescriptionItem> findByTenantIdAndMedicationId(@Param("tenantId") String tenantId, @Param("medicationId") Long medicationId);

    @Query("SELECT pi FROM PrescriptionItem pi WHERE pi.tenantId = :tenantId AND pi.quantityDispensed < pi.quantityPrescribed AND pi.deleted = false")
    List<PrescriptionItem> findIncompleteDispensedByTenantId(@Param("tenantId") String tenantId);

    @Query("SELECT pi FROM PrescriptionItem pi WHERE pi.tenantId = :tenantId AND pi.quantityDispensed >= pi.quantityPrescribed AND pi.deleted = false")
    List<PrescriptionItem> findFullyDispensedByTenantId(@Param("tenantId") String tenantId);

    @Query("SELECT pi FROM PrescriptionItem pi WHERE pi.tenantId = :tenantId AND pi.prescription.id = :prescriptionId AND pi.quantityDispensed < pi.quantityPrescribed AND pi.deleted = false")
    List<PrescriptionItem> findIncompleteDispensedByTenantIdAndPrescriptionId(@Param("tenantId") String tenantId, @Param("prescriptionId") Long prescriptionId);

    @Query("SELECT pi FROM PrescriptionItem pi WHERE pi.tenantId = :tenantId AND pi.prescription.id = :prescriptionId AND pi.quantityDispensed >= pi.quantityPrescribed AND pi.deleted = false")
    List<PrescriptionItem> findFullyDispensedByTenantIdAndPrescriptionId(@Param("tenantId") String tenantId, @Param("prescriptionId") Long prescriptionId);

    @Query("SELECT pi FROM PrescriptionItem pi WHERE pi.tenantId = :tenantId AND " +
           "(LOWER(pi.medication.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(pi.medication.medicationCode) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(pi.dosageInstructions) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "pi.deleted = false")
    List<PrescriptionItem> searchByTenantId(@Param("tenantId") String tenantId, @Param("searchTerm") String searchTerm);
}

