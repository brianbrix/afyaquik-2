package com.afyaquik.hms.appointment.api;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.appointment.dto.AppointmentDto;
import com.afyaquik.hms.appointment.dto.AppointmentFilterRequest;
import com.afyaquik.hms.appointment.dto.AppointmentRequest;
import com.afyaquik.hms.appointment.service.AppointmentService;
import com.afyaquik.hms.common.web.ApiResponse;

import jakarta.validation.Valid;

/**
 * REST Controller for appointment management.
 * Provides endpoints for CRUD operations on appointments.
 */
@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    /**
     * Create a new appointment
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentDto>> createAppointment(@Valid @RequestBody AppointmentRequest request) {
        try {
            AppointmentDto appointment = appointmentService.createAppointment(request);
            return ResponseEntity.ok(ApiResponse.success(appointment));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create appointment: " + e.getMessage()));
        }
    }

    /**
     * Get appointment by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentDto>> getAppointment(@PathVariable Long id) {
        try {
            Optional<AppointmentDto> appointment = appointmentService.getAppointmentById(id);
            if (appointment.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(appointment.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get appointment: " + e.getMessage()));
        }
    }

    /**
     * Get all appointments with optional filters
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getAppointments(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long providerId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) Boolean upcomingOnly,
            @RequestParam(required = false) Boolean todayOnly) {
        try {
            AppointmentFilterRequest filter = new AppointmentFilterRequest(
                    patientId, providerId, departmentId,
                    status != null ? com.afyaquik.hms.appointment.domain.AppointmentStatus.valueOf(status) : null,
                    startDate != null ? java.time.LocalDateTime.parse(startDate) : null,
                    endDate != null ? java.time.LocalDateTime.parse(endDate) : null,
                    searchTerm, upcomingOnly, todayOnly
            );
            
            List<AppointmentDto> appointments = appointmentService.getAppointmentsWithFilters(filter);
            return ResponseEntity.ok(ApiResponse.success(appointments));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get appointments: " + e.getMessage()));
        }
    }

    /**
     * Get appointments for a specific patient
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getAppointmentsByPatient(@PathVariable Long patientId) {
        try {
            List<AppointmentDto> appointments = appointmentService.getAppointmentsByPatient(patientId);
            return ResponseEntity.ok(ApiResponse.success(appointments));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get patient appointments: " + e.getMessage()));
        }
    }

    /**
     * Get appointments for a specific provider
     */
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getAppointmentsByProvider(@PathVariable Long providerId) {
        try {
            List<AppointmentDto> appointments = appointmentService.getAppointmentsByProvider(providerId);
            return ResponseEntity.ok(ApiResponse.success(appointments));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get provider appointments: " + e.getMessage()));
        }
    }

    /**
     * Get today's appointments for a provider
     */
    @GetMapping("/provider/{providerId}/today")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getTodayAppointmentsForProvider(@PathVariable Long providerId) {
        try {
            List<AppointmentDto> appointments = appointmentService.getTodayAppointmentsForProvider(providerId);
            return ResponseEntity.ok(ApiResponse.success(appointments));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get today's appointments: " + e.getMessage()));
        }
    }

    /**
     * Get upcoming appointments
     */
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<AppointmentDto>>> getUpcomingAppointments() {
        try {
            List<AppointmentDto> appointments = appointmentService.getUpcomingAppointments();
            return ResponseEntity.ok(ApiResponse.success(appointments));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get upcoming appointments: " + e.getMessage()));
        }
    }

    /**
     * Update an appointment
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentDto>> updateAppointment(
            @PathVariable Long id, 
            @Valid @RequestBody AppointmentRequest request) {
        try {
            AppointmentDto appointment = appointmentService.updateAppointment(id, request);
            return ResponseEntity.ok(ApiResponse.success(appointment));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update appointment: " + e.getMessage()));
        }
    }

    /**
     * Cancel an appointment
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentDto>> cancelAppointment(
            @PathVariable Long id, 
            @RequestParam(required = false) String reason) {
        try {
            AppointmentDto appointment = appointmentService.cancelAppointment(id, reason);
            return ResponseEntity.ok(ApiResponse.success(appointment));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to cancel appointment: " + e.getMessage()));
        }
    }

    /**
     * Complete an appointment
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<AppointmentDto>> completeAppointment(@PathVariable Long id) {
        try {
            AppointmentDto appointment = appointmentService.completeAppointment(id);
            return ResponseEntity.ok(ApiResponse.success(appointment));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to complete appointment: " + e.getMessage()));
        }
    }

    /**
     * Mark appointment as no-show
     */
    @PostMapping("/{id}/no-show")
    public ResponseEntity<ApiResponse<AppointmentDto>> markNoShow(@PathVariable Long id) {
        try {
            AppointmentDto appointment = appointmentService.markNoShow(id);
            return ResponseEntity.ok(ApiResponse.success(appointment));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to mark appointment as no-show: " + e.getMessage()));
        }
    }

    /**
     * Confirm an appointment
     */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<AppointmentDto>> confirmAppointment(@PathVariable Long id) {
        try {
            AppointmentDto appointment = appointmentService.confirmAppointment(id);
            return ResponseEntity.ok(ApiResponse.success(appointment));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to confirm appointment: " + e.getMessage()));
        }
    }

    /**
     * Delete an appointment
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(@PathVariable Long id) {
        try {
            appointmentService.deleteAppointment(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete appointment: " + e.getMessage()));
        }
    }
}
