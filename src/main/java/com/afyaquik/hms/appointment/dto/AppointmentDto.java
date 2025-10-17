package com.afyaquik.hms.appointment.dto;

import java.time.LocalDateTime;

import com.afyaquik.hms.appointment.domain.AppointmentStatus;

/**
 * Data Transfer Object for Appointment entity.
 * Used for API responses and data transfer between layers.
 */
public record AppointmentDto(
    Long id,
    Long patientId,
    String patientName,
    String patientMrn,
    Long providerId,
    String providerName,
    Long departmentId,
    String departmentName,
    LocalDateTime appointmentDateTime,
    Integer durationMinutes,
    AppointmentStatus status,
    String appointmentType,
    String reason,
    String notes,
    Boolean reminderSent,
    LocalDateTime reminderSentAt,
    String cancellationReason,
    LocalDateTime cancelledAt,
    LocalDateTime completedAt,
    LocalDateTime noShowAt,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    
    /**
     * Check if the appointment is upcoming
     */
    public boolean isUpcoming() {
        return appointmentDateTime.isAfter(LocalDateTime.now()) && 
               (status == AppointmentStatus.SCHEDULED || status == AppointmentStatus.CONFIRMED);
    }
    
    /**
     * Check if the appointment is past
     */
    public boolean isPast() {
        return appointmentDateTime.isBefore(LocalDateTime.now());
    }
    
    /**
     * Check if the appointment can be cancelled
     */
    public boolean canBeCancelled() {
        return (status == AppointmentStatus.SCHEDULED || status == AppointmentStatus.CONFIRMED) && 
               appointmentDateTime.isAfter(LocalDateTime.now());
    }
    
    /**
     * Check if the appointment can be rescheduled
     */
    public boolean canBeRescheduled() {
        return (status == AppointmentStatus.SCHEDULED || status == AppointmentStatus.CONFIRMED) && 
               appointmentDateTime.isAfter(LocalDateTime.now());
    }
    
    /**
     * Get the appointment end time
     */
    public LocalDateTime getEndTime() {
        return appointmentDateTime.plusMinutes(durationMinutes);
    }
    
    /**
     * Get a formatted date string
     */
    public String getFormattedDate() {
        return appointmentDateTime.toLocalDate().toString();
    }
    
    /**
     * Get a formatted time string
     */
    public String getFormattedTime() {
        return appointmentDateTime.toLocalTime().toString();
    }
}
