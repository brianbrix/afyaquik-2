package com.afyaquik.hms.appointment.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.appointment.domain.Appointment;
import com.afyaquik.hms.appointment.domain.AppointmentStatus;
import com.afyaquik.hms.common.repository.TenantAwareRepository;

/**
 * Repository interface for Appointment entity.
 * Provides methods for querying appointments with various filters.
 */
@Repository
public interface AppointmentRepository extends TenantAwareRepository<Appointment, Long> {

    /**
     * Find all appointments for a specific tenant
     */
    List<Appointment> findByTenantIdOrderByAppointmentDateTimeDesc(String tenantId);

    /**
     * Find appointments for a specific patient
     */
    List<Appointment> findByTenantIdAndPatientIdOrderByAppointmentDateTimeDesc(String tenantId, Long patientId);

    /**
     * Find appointments for a specific provider
     */
    List<Appointment> findByTenantIdAndProviderIdOrderByAppointmentDateTimeDesc(String tenantId, Long providerId);

    /**
     * Find appointments for a specific department
     */
    List<Appointment> findByTenantIdAndDepartmentIdOrderByAppointmentDateTimeDesc(String tenantId, Long departmentId);

    /**
     * Find appointments by status
     */
    List<Appointment> findByTenantIdAndStatusOrderByAppointmentDateTimeDesc(String tenantId, AppointmentStatus status);

    /**
     * Find appointments within a date range
     */
    List<Appointment> findByTenantIdAndAppointmentDateTimeBetweenOrderByAppointmentDateTimeDesc(
            String tenantId, LocalDateTime startDateTime, LocalDateTime endDateTime);

    /**
     * Find appointments for a provider within a date range
     */
    List<Appointment> findByTenantIdAndProviderIdAndAppointmentDateTimeBetweenOrderByAppointmentDateTimeDesc(
            String tenantId, Long providerId, LocalDateTime startDateTime, LocalDateTime endDateTime);

    /**
     * Find appointments for a patient within a date range
     */
    List<Appointment> findByTenantIdAndPatientIdAndAppointmentDateTimeBetweenOrderByAppointmentDateTimeDesc(
            String tenantId, Long patientId, LocalDateTime startDateTime, LocalDateTime endDateTime);

    /**
     * Find upcoming appointments (scheduled or confirmed, future date)
     */
    @Query("SELECT a FROM Appointment a WHERE a.tenantId = :tenantId " +
           "AND a.appointmentDateTime > :currentDateTime " +
           "AND a.status IN ('SCHEDULED', 'CONFIRMED') " +
           "ORDER BY a.appointmentDateTime ASC")
    List<Appointment> findUpcomingAppointments(@Param("tenantId") String tenantId, 
                                             @Param("currentDateTime") LocalDateTime currentDateTime);

    /**
     * Find today's appointments for a provider
     */
    @Query("SELECT a FROM Appointment a WHERE a.tenantId = :tenantId " +
           "AND a.provider.id = :providerId " +
           "AND DATE(a.appointmentDateTime) = DATE(:date) " +
           "ORDER BY a.appointmentDateTime ASC")
    List<Appointment> findTodayAppointmentsForProvider(@Param("tenantId") String tenantId, 
                                                     @Param("providerId") Long providerId, 
                                                     @Param("date") LocalDateTime date);

    /**
     * Find appointments that need reminders (scheduled/confirmed, within reminder window)
     */
    @Query("SELECT a FROM Appointment a WHERE a.tenantId = :tenantId " +
           "AND a.status IN ('SCHEDULED', 'CONFIRMED') " +
           "AND a.reminderSent = false " +
           "AND a.appointmentDateTime BETWEEN :startTime AND :endTime " +
           "ORDER BY a.appointmentDateTime ASC")
    List<Appointment> findAppointmentsNeedingReminders(@Param("tenantId") String tenantId,
                                                     @Param("startTime") LocalDateTime startTime,
                                                     @Param("endTime") LocalDateTime endTime);

    /**
     * Find appointments for a provider within a time range (for conflict checking)
     */
    @Query("SELECT a FROM Appointment a WHERE a.tenantId = :tenantId " +
           "AND a.provider.id = :providerId " +
           "AND a.status NOT IN ('CANCELLED', 'NO_SHOW', 'COMPLETED') " +
           "AND a.id != :excludeId " +
           "AND a.appointmentDateTime < :endTime " +
           "AND a.appointmentDateTime >= :startTime")
    List<Appointment> findAppointmentsInTimeRange(@Param("tenantId") String tenantId,
                                                @Param("providerId") Long providerId,
                                                @Param("startTime") LocalDateTime startTime,
                                                @Param("endTime") LocalDateTime endTime,
                                                @Param("excludeId") Long excludeId);

    /**
     * Find all appointments for a tenant
     */
    @Query("SELECT a FROM Appointment a WHERE a.tenantId = :tenantId ORDER BY a.appointmentDateTime DESC")
    List<Appointment> findAllByTenantId(@Param("tenantId") String tenantId);

    /**
     * Count appointments by status for a tenant
     */
    @Query("SELECT a.status, COUNT(a) FROM Appointment a WHERE a.tenantId = :tenantId GROUP BY a.status")
    List<Object[]> countAppointmentsByStatus(@Param("tenantId") String tenantId);

    /**
     * Find appointments by patient name (fuzzy search)
     */
    @Query("SELECT a FROM Appointment a WHERE a.tenantId = :tenantId " +
           "AND (LOWER(a.patient.firstName) LIKE LOWER(:searchTerm) " +
           "OR LOWER(a.patient.lastName) LIKE LOWER(:searchTerm) " +
           "OR LOWER(a.patient.medicalRecordNumber) LIKE LOWER(:searchTerm)) " +
           "ORDER BY a.appointmentDateTime DESC")
    List<Appointment> findByPatientNameContaining(@Param("tenantId") String tenantId, 
                                                @Param("searchTerm") String searchTerm);

    /**
     * Find appointments by provider name (fuzzy search)
     */
    @Query("SELECT a FROM Appointment a WHERE a.tenantId = :tenantId " +
           "AND (LOWER(a.provider.displayName) LIKE LOWER(:searchTerm)) " +
           "ORDER BY a.appointmentDateTime DESC")
    List<Appointment> findByProviderNameContaining(@Param("tenantId") String tenantId, 
                                                @Param("searchTerm") String searchTerm);

    /**
     * Find appointment by tenant ID and appointment ID
     */
    Optional<Appointment> findByTenantIdAndId(String tenantId, Long id);

    /**
     * Find appointments for current tenant
     */
    default List<Appointment> findAllForCurrentTenant() {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdOrderByAppointmentDateTimeDesc(tenantId);
    }

    /**
     * Find appointments for a specific patient in current tenant
     */
    default List<Appointment> findByPatientForCurrentTenant(Long patientId) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndPatientIdOrderByAppointmentDateTimeDesc(tenantId, patientId);
    }

    /**
     * Find appointments for a specific provider in current tenant
     */
    default List<Appointment> findByProviderForCurrentTenant(Long providerId) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndProviderIdOrderByAppointmentDateTimeDesc(tenantId, providerId);
    }

    /**
     * Find upcoming appointments for current tenant
     */
    default List<Appointment> findUpcomingForCurrentTenant() {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return findUpcomingAppointments(tenantId, java.time.LocalDateTime.now());
    }
}
