package com.afyaquik.hms.patient.dto;

import java.time.LocalDate;

public record PatientSummary(
        Long id,
        String medicalRecordNumber,
        String firstName,
        String lastName,
        String phone,
        String email,
        LocalDate dateOfBirth,
        String nationalId,
        String gender,
        // Additional fields
        String middleName,
        String alternatePhone,
        String address,
        String city,
        String state,
        String postalCode,
        String country,
        String emergencyContactName,
        String emergencyContactPhone,
        String emergencyContactRelationship,
        String allergies,
        String medications,
        String medicalHistory,
        String notes) {
}
