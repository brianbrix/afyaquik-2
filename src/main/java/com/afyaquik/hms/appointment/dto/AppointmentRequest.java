package com.afyaquik.hms.appointment.dto;

import java.time.LocalDateTime;

import com.afyaquik.hms.appointment.domain.AppointmentStatus;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating or updating appointments.
 * Used for API requests and validation.
 */
public record AppointmentRequest(
    @NotNull(message = "Patient ID is required")
    Long patientId,
    
    @NotNull(message = "Provider ID is required")
    Long providerId,
    
    @NotNull(message = "Department ID is required")
    Long departmentId,
    
    @NotNull(message = "Appointment date and time is required")
    @Future(message = "Appointment date must be in the future")
    LocalDateTime appointmentDateTime,
    
    @Min(value = 15, message = "Duration must be at least 15 minutes")
    Integer durationMinutes,
    
    AppointmentStatus status,
    
    @Size(max = 64, message = "Appointment type cannot exceed 64 characters")
    String appointmentType,
    
    @NotBlank(message = "Reason is required")
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    String reason,
    
    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    String notes
) {
    
    /**
     * Get the appointment end time
     */
    public LocalDateTime getEndTime() {
        return appointmentDateTime.plusMinutes(durationMinutes != null ? durationMinutes : 30);
    }
    
    /**
     * Validate that the appointment is not in the past
     */
    public boolean isValidDateTime() {
        return appointmentDateTime != null && appointmentDateTime.isAfter(LocalDateTime.now());
    }
}
