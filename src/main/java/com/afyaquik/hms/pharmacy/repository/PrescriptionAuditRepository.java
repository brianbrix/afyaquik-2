package com.afyaquik.hms.pharmacy.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.pharmacy.domain.PrescriptionAudit;

@Repository
public interface PrescriptionAuditRepository extends JpaRepository<PrescriptionAudit, Long> {

    /**
     * Find all audit entries for a specific prescription
     */
    List<PrescriptionAudit> findByTenantIdAndPrescriptionIdOrderByCreatedAtDesc(String tenantId, Long prescriptionId);

    /**
     * Find audit entries by action type
     */
    List<PrescriptionAudit> findByTenantIdAndActionTypeOrderByCreatedAtDesc(String tenantId, PrescriptionAudit.ActionType actionType);

    /**
     * Find audit entries for a specific user
     */
    List<PrescriptionAudit> findByTenantIdAndActionByOrderByCreatedAtDesc(String tenantId, String actionBy);

    /**
     * Get the latest audit entry for a prescription
     */
    @Query("SELECT pa FROM PrescriptionAudit pa WHERE pa.tenantId = :tenantId AND pa.prescription.id = :prescriptionId ORDER BY pa.createdAt DESC")
    List<PrescriptionAudit> findLatestByPrescription(@Param("tenantId") String tenantId, @Param("prescriptionId") Long prescriptionId);

    /**
     * Find audit entries within a date range
     */
    @Query("SELECT pa FROM PrescriptionAudit pa WHERE pa.tenantId = :tenantId AND pa.actionAt BETWEEN :startDate AND :endDate ORDER BY pa.actionAt DESC")
    List<PrescriptionAudit> findByDateRange(@Param("tenantId") String tenantId, 
                                           @Param("startDate") java.time.LocalDateTime startDate, 
                                           @Param("endDate") java.time.LocalDateTime endDate);
}
