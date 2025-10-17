package com.afyaquik.hms.appointment.domain;

import java.time.LocalDateTime;

import com.afyaquik.hms.appointment.converter.LocalDateTimeConverter;
import com.afyaquik.hms.auth.domain.Department;
import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.common.domain.BaseEntity;
import com.afyaquik.hms.patient.domain.Patient;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Represents a patient appointment with a healthcare provider.
 * Appointments track the patient, provider, scheduled time, status, and related metadata.
 */
@Entity
@Table(name = "appointments")
public class Appointment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false)
    private StaffUser provider;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "appointment_date_time", nullable = false)
    @Convert(converter = LocalDateTimeConverter.class)
    private LocalDateTime appointmentDateTime;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 30; // Default 30 minutes

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @Column(name = "appointment_type", length = 64)
    private String appointmentType; // e.g., "Consultation", "Follow-up", "Procedure"

    @Column(name = "reason", length = 500)
    private String reason; // Patient's reason for the appointment

    @Column(name = "notes", length = 1000)
    private String notes; // Provider notes

    @Column(name = "reminder_sent", nullable = false)
    private Boolean reminderSent = false;

    @Column(name = "reminder_sent_at")
    private LocalDateTime reminderSentAt;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "no_show_at")
    private LocalDateTime noShowAt;

    // Constructors
    public Appointment() {}

    public Appointment(Patient patient, StaffUser provider, Department department, 
                      LocalDateTime appointmentDateTime, String reason) {
        this.patient = patient;
        this.provider = provider;
        this.department = department;
        this.appointmentDateTime = appointmentDateTime;
        this.reason = reason;
    }

    // Getters and Setters
    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public StaffUser getProvider() {
        return provider;
    }

    public void setProvider(StaffUser provider) {
        this.provider = provider;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public LocalDateTime getAppointmentDateTime() {
        return appointmentDateTime;
    }

    public void setAppointmentDateTime(LocalDateTime appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public String getAppointmentType() {
        return appointmentType;
    }

    public void setAppointmentType(String appointmentType) {
        this.appointmentType = appointmentType;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getReminderSent() {
        return reminderSent;
    }

    public void setReminderSent(Boolean reminderSent) {
        this.reminderSent = reminderSent;
    }

    public LocalDateTime getReminderSentAt() {
        return reminderSentAt;
    }

    public void setReminderSentAt(LocalDateTime reminderSentAt) {
        this.reminderSentAt = reminderSentAt;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getNoShowAt() {
        return noShowAt;
    }

    public void setNoShowAt(LocalDateTime noShowAt) {
        this.noShowAt = noShowAt;
    }

    // Business methods
    public boolean isUpcoming() {
        return appointmentDateTime.isAfter(LocalDateTime.now()) && 
               (status == AppointmentStatus.SCHEDULED || status == AppointmentStatus.CONFIRMED);
    }

    public boolean isPast() {
        return appointmentDateTime.isBefore(LocalDateTime.now());
    }

    public boolean canBeCancelled() {
        return (status == AppointmentStatus.SCHEDULED || status == AppointmentStatus.CONFIRMED) && 
               appointmentDateTime.isAfter(LocalDateTime.now());
    }

    public boolean canBeRescheduled() {
        return (status == AppointmentStatus.SCHEDULED || status == AppointmentStatus.CONFIRMED) && 
               appointmentDateTime.isAfter(LocalDateTime.now());
    }
}
