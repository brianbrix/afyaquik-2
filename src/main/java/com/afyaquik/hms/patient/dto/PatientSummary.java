package com.afyaquik.hms.patient.dto;

import java.time.LocalDate;

public record PatientSummary(
        Long id,
        String medicalRecordNumber,
        String firstName,
        String lastName,
        String phone,
        String email,
        LocalDate dateOfBirth) {
}
