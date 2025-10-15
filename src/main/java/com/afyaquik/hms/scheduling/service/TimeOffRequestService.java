package com.afyaquik.hms.scheduling.service;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.scheduling.domain.TimeOffRequest;
import com.afyaquik.hms.scheduling.domain.TimeOffStatus;
import com.afyaquik.hms.scheduling.domain.TimeOffType;
import com.afyaquik.hms.scheduling.dto.CreateTimeOffRequestDto;
import com.afyaquik.hms.scheduling.dto.ReviewTimeOffRequestDto;
import com.afyaquik.hms.scheduling.dto.TimeOffRequestDto;
import com.afyaquik.hms.scheduling.repository.TimeOffRequestRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

@Service
@Transactional(readOnly = true)
public class TimeOffRequestService {

    private static final Logger log = LoggerFactory.getLogger(TimeOffRequestService.class);

    private final TimeOffRequestRepository timeOffRequestRepository;

    public TimeOffRequestService(TimeOffRequestRepository timeOffRequestRepository) {
        this.timeOffRequestRepository = timeOffRequestRepository;
    }

    @Transactional
    public TimeOffRequestDto createTimeOffRequest(CreateTimeOffRequestDto request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Creating time-off request for user {} in tenant {}", request.userId(), tenantId);

        // Check for overlapping requests
        List<TimeOffRequest> overlapping = timeOffRequestRepository.findOverlappingRequests(
            tenantId, request.userId(), request.startDate(), request.endDate());
        
        if (!overlapping.isEmpty()) {
            log.warn("Overlapping time-off request found for user {} in tenant {}", request.userId(), tenantId);
            throw new IllegalStateException("You already have a pending or approved time-off request for this period");
        }

        // Calculate total days
        long totalDays = ChronoUnit.DAYS.between(request.startDate(), request.endDate()) + 1;

        TimeOffRequest timeOffRequest = new TimeOffRequest();
        timeOffRequest.setTenantId(tenantId);
        timeOffRequest.setUserId(request.userId());
        timeOffRequest.setRequestType(request.requestType());
        timeOffRequest.setStartDate(request.startDate());
        timeOffRequest.setEndDate(request.endDate());
        timeOffRequest.setTotalDays((int) totalDays);
        timeOffRequest.setReason(request.reason());
        timeOffRequest.setStatus(TimeOffStatus.PENDING);
        timeOffRequest.setSubmittedAt(LocalDateTime.now());
        timeOffRequest.setEmergencyContact(request.emergencyContact());
        timeOffRequest.setEmergencyPhone(request.emergencyPhone());

        // TODO: Set supervisor from user's supervisor relationship
        // For now, we'll leave supervisor fields null and handle in admin

        TimeOffRequest saved = timeOffRequestRepository.save(timeOffRequest);
        log.info("Time-off request created with ID {} for user {} in tenant {}", 
                saved.getId(), request.userId(), tenantId);

        return toDto(saved);
    }

    @Transactional
    public TimeOffRequestDto reviewTimeOffRequest(Long requestId, ReviewTimeOffRequestDto review) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Reviewing time-off request {} with status {} in tenant {}", 
                requestId, review.status(), tenantId);

        TimeOffRequest request = timeOffRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Time-off request not found"));

        if (!request.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Tenant mismatch");
        }

        if (request.getStatus() != TimeOffStatus.PENDING) {
            throw new IllegalStateException("Request has already been reviewed");
        }

        request.setStatus(review.status());
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewNotes(review.reviewNotes());
        // TODO: Set reviewedBy from current user context

        TimeOffRequest saved = timeOffRequestRepository.save(request);
        log.info("Time-off request {} reviewed with status {} in tenant {}", 
                requestId, review.status(), tenantId);

        return toDto(saved);
    }

    public List<TimeOffRequestDto> getMyTimeOffRequests(Long userId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching time-off requests for user {} in tenant {}", userId, tenantId);

        List<TimeOffRequest> requests = timeOffRequestRepository
                .findByTenantIdAndUserIdOrderBySubmittedAtDesc(tenantId, userId);

        return requests.stream().map(this::toDto).toList();
    }

    public List<TimeOffRequestDto> getPendingReviews(Long supervisorId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching pending time-off reviews for supervisor {} in tenant {}", supervisorId, tenantId);

        List<TimeOffRequest> requests = timeOffRequestRepository
                .findByTenantIdAndSupervisorIdOrderBySubmittedAtDesc(tenantId, supervisorId);

        return requests.stream().map(this::toDto).toList();
    }

    public List<TimeOffRequestDto> getAllTimeOffRequests(Pageable pageable) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching all time-off requests in tenant {}", tenantId);

        List<TimeOffRequest> requests = timeOffRequestRepository
                .findByTenantIdOrderBySubmittedAtDesc(tenantId);

        return requests.stream().map(this::toDto).toList();
    }

    public List<TimeOffRequestDto> getTimeOffRequestsByStatus(TimeOffStatus status) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching time-off requests with status {} in tenant {}", status, tenantId);

        List<TimeOffRequest> requests = timeOffRequestRepository
                .findByTenantIdAndStatusOrderBySubmittedAtDesc(tenantId, status);

        return requests.stream().map(this::toDto).toList();
    }

    public List<TimeOffRequestDto> getTimeOffRequestsByDateRange(LocalDate startDate, LocalDate endDate) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Fetching time-off requests for date range {} to {} in tenant {}", startDate, endDate, tenantId);

        List<TimeOffRequest> requests = timeOffRequestRepository
                .findByDateRange(tenantId, startDate, endDate);

        return requests.stream().map(this::toDto).toList();
    }

    public long getPendingReviewsCount(Long supervisorId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return timeOffRequestRepository.countByTenantIdAndSupervisorIdAndStatus(
                tenantId, supervisorId, TimeOffStatus.PENDING);
    }

    @Transactional
    public void cancelTimeOffRequest(Long requestId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        log.info("Cancelling time-off request {} in tenant {}", requestId, tenantId);

        TimeOffRequest request = timeOffRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Time-off request not found"));

        if (!request.getTenantId().equals(tenantId)) {
            throw new IllegalStateException("Tenant mismatch");
        }

        if (request.getStatus() != TimeOffStatus.PENDING) {
            throw new IllegalStateException("Only pending requests can be cancelled");
        }

        request.setStatus(TimeOffStatus.CANCELLED);
        timeOffRequestRepository.save(request);
        log.info("Time-off request {} cancelled in tenant {}", requestId, tenantId);
    }

    private TimeOffRequestDto toDto(TimeOffRequest request) {
        return new TimeOffRequestDto(
                request.getId(),
                request.getUserId(),
                request.getUserDisplayName(),
                request.getSupervisorId(),
                request.getSupervisorDisplayName(),
                request.getRequestType(),
                request.getStartDate(),
                request.getEndDate(),
                request.getTotalDays(),
                request.getReason(),
                request.getStatus(),
                request.getSubmittedAt(),
                request.getReviewedAt(),
                request.getReviewedBy(),
                request.getReviewerDisplayName(),
                request.getReviewNotes(),
                request.getEmergencyContact(),
                request.getEmergencyPhone()
        );
    }
}
