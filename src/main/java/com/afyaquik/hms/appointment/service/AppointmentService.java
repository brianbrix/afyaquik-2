package com.afyaquik.hms.appointment.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.appointment.domain.Appointment;
import com.afyaquik.hms.appointment.domain.AppointmentStatus;
import com.afyaquik.hms.appointment.dto.AppointmentDto;
import com.afyaquik.hms.appointment.dto.AppointmentFilterRequest;
import com.afyaquik.hms.appointment.dto.AppointmentRequest;
import com.afyaquik.hms.appointment.repository.AppointmentRepository;
import com.afyaquik.hms.auth.domain.Department;
import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.DepartmentRepository;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.auth.service.PermissionService;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.patient.domain.Patient;
import com.afyaquik.hms.patient.repository.PatientRepository;

import lombok.extern.slf4j.Slf4j;

/**
 * Service class for managing appointments.
 * Provides business logic for appointment operations.
 */
@Service
@Transactional
@Slf4j
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private StaffUserRepository staffUserRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PermissionService permissionService;

    /**
     * Create a new appointment
     */
    public AppointmentDto createAppointment(AppointmentRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Creating appointment for tenant={}, patientId={}, providerId={}", 
                tenantId, request.patientId(), request.providerId());

        // Validate entities exist
        Patient patient = patientRepository.findByIdForCurrentTenant(request.patientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        
        StaffUser provider = staffUserRepository.findByIdForCurrentTenant(request.providerId())
                .orElseThrow(() -> new IllegalArgumentException("Provider not found"));
        
        Department department = departmentRepository.findByIdForCurrentTenant(request.departmentId())
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        // Check for conflicts
        if (hasConflictingAppointment(tenantId, request.providerId(), 
                                    request.appointmentDateTime(), request.getEndTime(), null)) {
            throw new IllegalStateException("Provider has a conflicting appointment at this time");
        }

        // Create appointment
        Appointment appointment = new Appointment();
        appointment.setTenantId(tenantId);
        appointment.setPatient(patient);
        appointment.setProvider(provider);
        appointment.setDepartment(department);
        appointment.setAppointmentDateTime(request.appointmentDateTime());
        appointment.setDurationMinutes(request.durationMinutes() != null ? request.durationMinutes() : 30);
        appointment.setStatus(request.status() != null ? request.status() : AppointmentStatus.SCHEDULED);
        appointment.setAppointmentType(request.appointmentType());
        appointment.setReason(request.reason());
        appointment.setNotes(request.notes());

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Appointment created successfully: {}", saved.getId());
        
        return convertToDto(saved);
    }

    /**
     * Update an existing appointment
     */
    public AppointmentDto updateAppointment(Long id, AppointmentRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Updating appointment for tenant={}, appointmentId={}", tenantId, id);

        Appointment appointment = appointmentRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        // Validate entities exist
        Patient patient = patientRepository.findByIdForCurrentTenant(request.patientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        
        StaffUser provider = staffUserRepository.findByIdForCurrentTenant(request.providerId())
                .orElseThrow(() -> new IllegalArgumentException("Provider not found"));
        
        Department department = departmentRepository.findByIdForCurrentTenant(request.departmentId())
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        // Check for conflicts (excluding current appointment)
        if (hasConflictingAppointment(tenantId, request.providerId(), 
                                    request.appointmentDateTime(), request.getEndTime(), id)) {
            throw new IllegalStateException("Provider has a conflicting appointment at this time");
        }

        // Update appointment
        appointment.setPatient(patient);
        appointment.setProvider(provider);
        appointment.setDepartment(department);
        appointment.setAppointmentDateTime(request.appointmentDateTime());
        appointment.setDurationMinutes(request.durationMinutes() != null ? request.durationMinutes() : 30);
        appointment.setStatus(request.status() != null ? request.status() : appointment.getStatus());
        appointment.setAppointmentType(request.appointmentType());
        appointment.setReason(request.reason());
        appointment.setNotes(request.notes());

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Appointment updated successfully: {}", saved.getId());
        
        return convertToDto(saved);
    }

    /**
     * Get appointment by ID
     */
    @Transactional(readOnly = true)
    public Optional<AppointmentDto> getAppointmentById(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return appointmentRepository.findByTenantIdAndId(tenantId, id)
                .map(this::convertToDto);
    }

    /**
     * Get all appointments for the current tenant
     */
    @Transactional(readOnly = true)
    public List<AppointmentDto> getAllAppointments() {
        return appointmentRepository.findAllForCurrentTenant()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get appointments with filters
     */
    @Transactional(readOnly = true)
    public List<AppointmentDto> getAppointmentsWithFilters(AppointmentFilterRequest filter) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        List<Appointment> appointments;
        
        // Handle search term filtering
        if (filter.searchTerm() != null && !filter.searchTerm().trim().isEmpty()) {
            // If search term is provided, search by patient name
            String searchTerm = "%" + filter.searchTerm().trim() + "%";
            appointments = appointmentRepository.findByPatientNameContaining(tenantId, searchTerm);
        } else {
            // Get all appointments for the tenant
            appointments = appointmentRepository.findAllByTenantId(tenantId);
        }
        
        // Apply permission-based filtering
        appointments = filterByUserPermissions(appointments);
        
        // Apply additional filters in Java
        List<Appointment> filteredAppointments = appointments.stream()
                .filter(appointment -> {
                    // Filter by patient ID
                    if (filter.patientId() != null && !appointment.getPatient().getId().equals(filter.patientId())) {
                        return false;
                    }
                    
                    // Filter by provider ID
                    if (filter.providerId() != null && !appointment.getProvider().getId().equals(filter.providerId())) {
                        return false;
                    }
                    
                    // Filter by department ID
                    if (filter.departmentId() != null && !appointment.getDepartment().getId().equals(filter.departmentId())) {
                        return false;
                    }
                    
                    // Filter by status
                    if (filter.status() != null && appointment.getStatus() != filter.status()) {
                        return false;
                    }
                    
                    // Filter by start date
                    if (filter.startDate() != null && appointment.getAppointmentDateTime().isBefore(filter.startDate())) {
                        return false;
                    }
                    
                    // Filter by end date
                    if (filter.endDate() != null && appointment.getAppointmentDateTime().isAfter(filter.endDate())) {
                        return false;
                    }
                    
                    // Handle upcoming only filter
                    if (Boolean.TRUE.equals(filter.upcomingOnly())) {
                        return appointment.getAppointmentDateTime().isAfter(LocalDateTime.now());
                    }
                    
                    // Handle today only filter
                    if (Boolean.TRUE.equals(filter.todayOnly())) {
                        LocalDateTime today = LocalDateTime.now();
                        LocalDateTime startOfDay = today.toLocalDate().atStartOfDay();
                        LocalDateTime endOfDay = today.toLocalDate().atTime(23, 59, 59);
                        return !appointment.getAppointmentDateTime().isBefore(startOfDay) && 
                               !appointment.getAppointmentDateTime().isAfter(endOfDay);
                    }
                    
                    return true;
                })
                .collect(Collectors.toList());
        
        return filteredAppointments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get appointments with filters (paged)
     */
    @Transactional(readOnly = true)
    public Page<AppointmentDto> getAppointmentsWithFiltersPaged(AppointmentFilterRequest filter, Pageable pageable) {
        List<AppointmentDto> all = getAppointmentsWithFilters(filter);
        int start = Math.min((int) pageable.getOffset(), all.size());
        int end = Math.min(start + pageable.getPageSize(), all.size());
        List<AppointmentDto> slice = all.subList(start, end);
        return new PageImpl<>(slice, pageable, all.size());
    }

    /**
     * Filter appointments based on user permissions
     */
    private List<Appointment> filterByUserPermissions(List<Appointment> appointments) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return List.of();
        }

        String username = authentication.getName();

        // Admins/managers can see all
        boolean isAdmin = authentication.getAuthorities() != null && authentication.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN") || a.equals("ADMIN") || a.equals("ROLE_SCHEDULING_MANAGER") || a.equals("SCHEDULING_MANAGER"));

        boolean canViewAllAppointments = isAdmin || permissionService.hasPermission(username, "VIEW_ALL_APPOINTMENTS");
        if (canViewAllAppointments) {
            return appointments;
        }

        // Otherwise only appointments where current user is the provider
        return appointments.stream()
                .filter(appointment -> {
                    String providerUsername = appointment.getProvider().getUsername();
                    return username.equals(providerUsername);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get appointments for a specific patient
     */
    @Transactional(readOnly = true)
    public List<AppointmentDto> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientForCurrentTenant(patientId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get appointments for a specific provider
     */
    @Transactional(readOnly = true)
    public List<AppointmentDto> getAppointmentsByProvider(Long providerId) {
        return appointmentRepository.findByProviderForCurrentTenant(providerId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get today's appointments for a provider
     */
    @Transactional(readOnly = true)
    public List<AppointmentDto> getTodayAppointmentsForProvider(Long providerId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        LocalDateTime today = LocalDateTime.now();
        return appointmentRepository.findTodayAppointmentsForProvider(tenantId, providerId, today)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get upcoming appointments
     */
    @Transactional(readOnly = true)
    public List<AppointmentDto> getUpcomingAppointments() {
        return appointmentRepository.findUpcomingForCurrentTenant()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Cancel an appointment
     */
    public AppointmentDto cancelAppointment(Long id, String cancellationReason) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Cancelling appointment for tenant={}, appointmentId={}", tenantId, id);

        Appointment appointment = appointmentRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (!appointment.canBeCancelled()) {
            throw new IllegalStateException("Appointment cannot be cancelled");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(cancellationReason);
        appointment.setCancelledAt(LocalDateTime.now());

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Appointment cancelled successfully: {}", saved.getId());
        
        return convertToDto(saved);
    }

    /**
     * Mark appointment as completed
     */
    public AppointmentDto completeAppointment(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Completing appointment for tenant={}, appointmentId={}", tenantId, id);

        Appointment appointment = appointmentRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setCompletedAt(LocalDateTime.now());

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Appointment completed successfully: {}", saved.getId());
        
        return convertToDto(saved);
    }

    /**
     * Mark appointment as no-show
     */
    public AppointmentDto markNoShow(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Marking appointment as no-show for tenant={}, appointmentId={}", tenantId, id);

        Appointment appointment = appointmentRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.NO_SHOW);
        appointment.setNoShowAt(LocalDateTime.now());

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Appointment marked as no-show successfully: {}", saved.getId());
        
        return convertToDto(saved);
    }

    /**
     * Confirm an appointment
     */
    public AppointmentDto confirmAppointment(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Confirming appointment for tenant={}, appointmentId={}", tenantId, id);

        Appointment appointment = appointmentRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.SCHEDULED) {
            throw new IllegalStateException("Only scheduled appointments can be confirmed");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Appointment confirmed successfully: {}", saved.getId());
        
        return convertToDto(saved);
    }

    /**
     * Delete an appointment
     */
    public void deleteAppointment(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Deleting appointment for tenant={}, appointmentId={}", tenantId, id);

        Appointment appointment = appointmentRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new IllegalStateException("Completed appointments cannot be deleted");
        }

        appointmentRepository.delete(appointment);
        log.info("Appointment deleted successfully: {}", id);
    }

    /**
     * Check for appointment conflicts
     */
    private boolean hasConflictingAppointment(String tenantId, Long providerId, 
                                            LocalDateTime startTime, LocalDateTime endTime, Long excludeId) {
        // Find all appointments for this provider in the time range
        List<Appointment> appointmentsInRange = appointmentRepository.findAppointmentsInTimeRange(
                tenantId, providerId, startTime, endTime, excludeId);
        
        // Check if any of these appointments actually overlap with the new appointment
        for (Appointment appointment : appointmentsInRange) {
            LocalDateTime existingStart = appointment.getAppointmentDateTime();
            LocalDateTime existingEnd = existingStart.plusMinutes(appointment.getDurationMinutes());
            
            // Check for overlap: new appointment overlaps if it starts before existing ends
            // and ends after existing starts
            if (startTime.isBefore(existingEnd) && endTime.isAfter(existingStart)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Convert Appointment entity to DTO
     */
    private AppointmentDto convertToDto(Appointment appointment) {
        return new AppointmentDto(
                appointment.getId(),
                appointment.getPatient().getId(),
                appointment.getPatient().getFirstName() + " " + appointment.getPatient().getLastName(),
                appointment.getPatient().getMedicalRecordNumber(),
                appointment.getProvider().getId(),
                appointment.getProvider().getDisplayName(),
                appointment.getDepartment().getId(),
                appointment.getDepartment().getDisplayName(),
                appointment.getAppointmentDateTime(),
                appointment.getDurationMinutes(),
                appointment.getStatus(),
                appointment.getAppointmentType(),
                appointment.getReason(),
                appointment.getNotes(),
                appointment.getReminderSent(),
                appointment.getReminderSentAt(),
                appointment.getCancellationReason(),
                appointment.getCancelledAt(),
                appointment.getCompletedAt(),
                appointment.getNoShowAt(),
                appointment.getCreatedAt() != null ? appointment.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime() : null,
                appointment.getUpdatedAt() != null ? appointment.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime() : null
        );
    }
}
