package com.afyaquik.hms.appointment.dto;

import java.time.LocalDateTime;

import com.afyaquik.hms.appointment.domain.AppointmentStatus;

/**
 * Request DTO for filtering appointments.
 * Used for search and filter operations.
 */
public record AppointmentFilterRequest(
    Long patientId,
    Long providerId,
    Long departmentId,
    AppointmentStatus status,
    LocalDateTime startDate,
    LocalDateTime endDate,
    String searchTerm,
    Boolean upcomingOnly,
    Boolean todayOnly
) {
    
    /**
     * Check if any filters are applied
     */
    public boolean hasFilters() {
        return patientId != null || providerId != null || departmentId != null || 
               status != null || startDate != null || endDate != null || 
               (searchTerm != null && !searchTerm.trim().isEmpty()) || 
               Boolean.TRUE.equals(upcomingOnly) || Boolean.TRUE.equals(todayOnly);
    }
    
    /**
     * Get the search term trimmed and lowercased
     */
    public String getSearchTerm() {
        return searchTerm != null ? searchTerm.trim().toLowerCase() : null;
    }
}
