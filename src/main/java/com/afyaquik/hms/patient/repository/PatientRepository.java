package com.afyaquik.hms.patient.repository;

import com.afyaquik.hms.patient.domain.Patient;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByTenantIdAndMedicalRecordNumber(String tenantId, String medicalRecordNumber);

    List<Patient> findByTenantIdAndLastNameContainingIgnoreCase(String tenantId, String lastName);

    List<Patient> findByTenantIdAndPhoneContainingIgnoreCase(String tenantId, String phone);
}
