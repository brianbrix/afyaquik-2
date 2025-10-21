package com.afyaquik.hms.patient.api;

import java.time.LocalDate;

import jakarta.validation.constraints.Size;

public record UpdatePatientRequest(
        @Size(max = 32)
        String medicalRecordNumber,

        @Size(max = 64)
        String firstName,

        @Size(max = 64)
        String lastName,

        @Size(max = 32)
        String phone,

        @Size(max = 128)
        String email,

        LocalDate dateOfBirth,

        @Size(max = 64)
        String nationalId,

        @Size(max = 16)
        String gender,
        
        // Additional fields
        @Size(max = 64)
        String middleName,

        @Size(max = 32)
        String alternatePhone,

        @Size(max = 512)
        String address,

        @Size(max = 64)
        String city,

        @Size(max = 64)
        String state,

        @Size(max = 16)
        String postalCode,

        @Size(max = 64)
        String country,

        @Size(max = 128)
        String emergencyContactName,

        @Size(max = 32)
        String emergencyContactPhone,

        @Size(max = 32)
        String emergencyContactRelationship,

        String allergies,

        String medications,

        String medicalHistory,

        String notes
) {
}
