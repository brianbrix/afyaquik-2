package com.afyaquik.hms.patient.api;

import com.afyaquik.hms.queue.domain.QueuePriority;
import com.afyaquik.hms.queue.domain.QueueStatus;
import java.time.Instant;
import java.time.LocalDate;

public record PatientResponse(
        Long id,
        String medicalRecordNumber,
        String firstName,
        String lastName,
        String phone,
        String email,
        LocalDate dateOfBirth,
        String nationalId,
        String gender,
        QueueStatus currentStatus,
        QueuePriority priority,
        Instant slaDueAt,
        String ticketNumber,
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
