package com.afyaquik.hms.patient.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreatePatientRequest(
        @NotBlank(message = "Medical record number is required")
        @Size(max = 32)
        String medicalRecordNumber,

        @NotBlank(message = "First name is required")
        @Size(max = 64)
        String firstName,

        @NotBlank(message = "Last name is required")
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

        String visitReason,

        String priority
) {
}
