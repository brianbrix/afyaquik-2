package com.afyaquik.hms.appointment.domain;

/**
 * Enum representing the possible statuses of an appointment.
 */
public enum AppointmentStatus {
    /**
     * Appointment has been scheduled but not yet confirmed by the patient
     */
    SCHEDULED,
    
    /**
     * Appointment has been confirmed by the patient
     */
    CONFIRMED,
    
    /**
     * Patient has arrived and is waiting to be seen
     */
    ARRIVED,
    
    /**
     * Patient is currently being seen by the provider
     */
    IN_PROGRESS,
    
    /**
     * Appointment has been completed successfully
     */
    COMPLETED,
    
    /**
     * Appointment was cancelled by the patient or provider
     */
    CANCELLED,
    
    /**
     * Patient did not show up for the appointment
     */
    NO_SHOW,
    
    /**
     * Appointment was rescheduled to a different time
     */
    RESCHEDULED
}

