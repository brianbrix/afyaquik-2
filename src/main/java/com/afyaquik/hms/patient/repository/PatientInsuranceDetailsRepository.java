package com.afyaquik.hms.patient.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import com.afyaquik.hms.patient.model.PatientInsuranceDetails;
import com.afyaquik.hms.patient.domain.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;


@Repository
public interface PatientInsuranceDetailsRepository extends TenantAwareRepository<PatientInsuranceDetails, Long> {
    @EntityGraph(attributePaths = {"provider", "plan"})
    java.util.List<PatientInsuranceDetails> findAllByPatient(Patient patient);

    @Override
    @EntityGraph(attributePaths = {"provider", "plan", "patient"})
    @NonNull
    java.util.Optional<PatientInsuranceDetails> findById(@NonNull Long id);
}
