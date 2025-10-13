package com.afyaquik.hms.patient.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientInsuranceDetailsDto {
    private Long id;
    private Long patientId;
    private Long providerId;
    private Long planId;
    private String policyNumber;
    private String coverageType;
    private LocalDate expiryDate;
    // Optionally, add provider/plan names for display
    private String providerName;
    private String planName;
}
