
package com.afyaquik.hms.patient.repository;

import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends TenantAwareRepository<Patient, Long>, JpaSpecificationExecutor<Patient> {


    Optional<Patient> findByTenantIdAndMedicalRecordNumber(String tenantId, String medicalRecordNumber);

    List<Patient> findByTenantIdAndLastNameContainingIgnoreCase(String tenantId, String lastName);

    List<Patient> findByTenantIdAndPhoneContainingIgnoreCase(String tenantId, String phone);
    
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
}
