package com.afyaquik.hms.patient.api;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.patient.repository.PatientRepository;

@RestController
@RequestMapping("/api/v1/patients")
public class PatientSearchController {

    @Autowired
    private PatientRepository patientRepository;

    /**
     * Search patients by name, phone, email, national ID, or MRN.
     */
    @GetMapping("/search")
    @PreAuthorize("hasPermission(null,'VIEW_PATIENTS')")
    public ResponseEntity<ApiResponse<List<PatientSearchResult>>> searchPatients(@RequestParam String q) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        if (q.trim().length() < 2) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
        
        String searchTerm = "%" + q.trim().toLowerCase() + "%";
        
        List<Patient> patients = patientRepository.findByTenantIdAndDeletedFalseAndSearchTerm(
            tenantId, searchTerm, searchTerm, searchTerm, searchTerm
        );
        
        List<PatientSearchResult> results = patients.stream()
            .map(this::convertToSearchResult)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    private PatientSearchResult convertToSearchResult(Patient patient) {
        return new PatientSearchResult(
            patient.getId(),
            patient.getFirstName(),
            patient.getLastName(),
            patient.getEmail(),
            patient.getPhone(),
            patient.getNationalId(),
            patient.getMedicalRecordNumber(),
            patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : null,
            patient.getGender() != null ? patient.getGender() : null
        );
    }

    public record PatientSearchResult(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String nationalId,
        String mrn,
        String dateOfBirth,
        String gender
    ) {}
}
