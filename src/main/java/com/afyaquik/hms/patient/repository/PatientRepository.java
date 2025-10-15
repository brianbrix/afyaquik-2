
package com.afyaquik.hms.patient.repository;

import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends TenantAwareRepository<Patient, Long>, JpaSpecificationExecutor<Patient> {


    Optional<Patient> findByTenantIdAndMedicalRecordNumber(String tenantId, String medicalRecordNumber);

    List<Patient> findByTenantIdAndLastNameContainingIgnoreCase(String tenantId, String lastName);

    List<Patient> findByTenantIdAndPhoneContainingIgnoreCase(String tenantId, String phone);
    
    // Search patients by multiple fields
    @Query("SELECT p FROM Patient p WHERE p.tenantId = :tenantId AND p.deleted = false AND " +
           "(LOWER(p.firstName) LIKE LOWER(:searchTerm) OR " +
           "LOWER(p.lastName) LIKE LOWER(:searchTerm) OR " +
           "LOWER(p.email) LIKE LOWER(:emailTerm) OR " +
           "LOWER(p.phone) LIKE LOWER(:phoneTerm) OR " +
           "LOWER(p.nationalId) LIKE LOWER(:nationalIdTerm)) " +
           "ORDER BY p.firstName, p.lastName")
    List<Patient> findByTenantIdAndDeletedFalseAndSearchTerm(
        @Param("tenantId") String tenantId,
        @Param("searchTerm") String searchTerm,
        @Param("emailTerm") String emailTerm,
        @Param("phoneTerm") String phoneTerm,
        @Param("nationalIdTerm") String nationalIdTerm
    );
    
    // Dashboard statistics
    long countByTenantId(String tenantId);
    
    // Tenant-aware default methods
    default Optional<Patient> findByMedicalRecordNumberForCurrentTenant(String medicalRecordNumber) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndMedicalRecordNumber(tenantId, medicalRecordNumber);
    }
    
    default List<Patient> findByLastNameContainingForCurrentTenant(String lastName) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndLastNameContainingIgnoreCase(tenantId, lastName);
    }
    
    default List<Patient> findByPhoneContainingForCurrentTenant(String phone) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndPhoneContainingIgnoreCase(tenantId, phone);
    }
    
    // Analytics methods
    long countByTenantIdAndDeletedFalse(String tenantId);
    long countByTenantIdAndCreatedAtBetweenAndDeletedFalse(String tenantId, LocalDateTime startDate, LocalDateTime endDate);
}
