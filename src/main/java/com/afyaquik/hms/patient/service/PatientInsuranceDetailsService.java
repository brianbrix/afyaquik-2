// ...existing code...

package com.afyaquik.hms.patient.service;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.insurance.domain.InsurancePlan;
import com.afyaquik.hms.insurance.domain.InsuranceProvider;
import com.afyaquik.hms.insurance.repository.InsurancePlanRepository;
import com.afyaquik.hms.insurance.repository.InsuranceProviderRepository;
import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.patient.domain.PatientInsuranceDetails;
import com.afyaquik.hms.patient.repository.PatientInsuranceDetailsRepository;
import com.afyaquik.hms.patient.repository.PatientRepository;
import com.afyaquik.hms.patient.dto.PatientInsuranceDetailsDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PatientInsuranceDetailsService {

    public PatientInsuranceDetailsDto saveInsuranceDetailsDto(Long patientId, PatientInsuranceDetailsDto dto) {
        return saveInsuranceDetails(patientId, dto);
    }

    public java.util.List<PatientInsuranceDetailsDto> getAllInsuranceDetailsDto(Long patientId) {
        return patientRepository.findById(patientId)
                .map(insuranceDetailsRepository::findAllByPatient)
                .orElse(java.util.Collections.emptyList())
                .stream().map(this::toDto).toList();
    }

    private PatientInsuranceDetailsDto toDto(PatientInsuranceDetails details) {
        if (details == null) return null;
        PatientInsuranceDetailsDto dto = new PatientInsuranceDetailsDto();
        dto.setId(details.getId());
        dto.setPatientId(details.getPatient() != null ? details.getPatient().getId() : null);
        dto.setProviderId(details.getProvider() != null ? details.getProvider().getId() : null);
        dto.setPlanId(details.getPlan() != null ? details.getPlan().getId() : null);
        dto.setPolicyNumber(details.getPolicyNumber());
        dto.setCoverageType(details.getCoverageType());
        dto.setExpiryDate(details.getExpiryDate());
        dto.setProviderName(details.getProvider() != null ? details.getProvider().getName() : null);
        dto.setPlanName(details.getPlan() != null ? details.getPlan().getName() : null);
        return dto;
    }
    @Autowired
    private PatientInsuranceDetailsRepository insuranceDetailsRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private InsuranceProviderRepository providerRepository;
    @Autowired
    private InsurancePlanRepository planRepository;

    @Transactional
    public PatientInsuranceDetailsDto saveInsuranceDetails(Long patientId, PatientInsuranceDetailsDto dto) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        InsuranceProvider provider = null;
        if (dto.getProviderId() != null) {
            provider = providerRepository.findById(dto.getProviderId())
                    .orElseThrow(() -> new IllegalArgumentException("Provider not found"));
        }

        InsurancePlan plan = null;
        if (dto.getPlanId() != null) {
            plan = planRepository.findById(dto.getPlanId())
                    .orElseThrow(() -> new IllegalArgumentException("Plan not found"));
        }

        PatientInsuranceDetails details;

        if (dto.getId() != null) {
            // Use eager fetch for update
            details = insuranceDetailsRepository.findById(dto.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Insurance details not found"));
            // Only allow editing if the record belongs to the patient
            if (!details.getPatient().getId().equals(patientId)) {
                throw new IllegalArgumentException("Insurance details do not belong to this patient");
            }
        } else {
            details = new PatientInsuranceDetails();
            details.setPatient(patient);
        }
        details.setProvider(provider);
        details.setPlan(plan);
        details.setTenantId(TenantHeaderInterceptor.getCurrentTenant());
        details.setPolicyNumber(dto.getPolicyNumber());
        details.setCoverageType(dto.getCoverageType());
        details.setExpiryDate(dto.getExpiryDate());
    PatientInsuranceDetails saved = insuranceDetailsRepository.save(details);
    return toDto(saved);
    }


    public List<PatientInsuranceDetailsDto> getInsuranceDetails(Long patientId) {
        return patientRepository.findById(patientId)
                .map(insuranceDetailsRepository::findAllByPatient)
                .orElse(java.util.Collections.emptyList())
                .stream().map(this::toDto).toList();
    }

    public boolean deleteInsuranceDetails(Long id) {
        if (insuranceDetailsRepository.existsById(id)) {
            insuranceDetailsRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
