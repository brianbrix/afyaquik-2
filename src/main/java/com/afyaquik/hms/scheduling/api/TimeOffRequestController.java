package com.afyaquik.hms.scheduling.api;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.scheduling.domain.TimeOffStatus;
import com.afyaquik.hms.scheduling.dto.CreateTimeOffRequestDto;
import com.afyaquik.hms.scheduling.dto.ReviewTimeOffRequestDto;
import com.afyaquik.hms.scheduling.dto.TimeOffRequestDto;
import com.afyaquik.hms.scheduling.service.TimeOffRequestService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/time-off")
public class TimeOffRequestController {

    private final TimeOffRequestService timeOffRequestService;

    public TimeOffRequestController(TimeOffRequestService timeOffRequestService) {
        this.timeOffRequestService = timeOffRequestService;
    }

    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<TimeOffRequestDto>> createTimeOffRequest(
            @Valid @RequestBody CreateTimeOffRequestDto request) {
        TimeOffRequestDto response = timeOffRequestService.createTimeOffRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    @PutMapping("/requests/{id}/review")
    public ResponseEntity<ApiResponse<TimeOffRequestDto>> reviewTimeOffRequest(
            @PathVariable Long id,
            @Valid @RequestBody ReviewTimeOffRequestDto review) {
        TimeOffRequestDto response = timeOffRequestService.reviewTimeOffRequest(id, review);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/requests/my")
    public ResponseEntity<ApiResponse<List<TimeOffRequestDto>>> getMyTimeOffRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "submittedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        List<TimeOffRequestDto> response = timeOffRequestService.getMyTimeOffRequests(
                getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/requests/pending")
    public ResponseEntity<ApiResponse<List<TimeOffRequestDto>>> getPendingReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "submittedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        List<TimeOffRequestDto> response = timeOffRequestService.getPendingReviews(
                getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<TimeOffRequestDto>>> getAllTimeOffRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "submittedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) TimeOffStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        List<TimeOffRequestDto> response;
        if (status != null) {
            response = timeOffRequestService.getTimeOffRequestsByStatus(status);
        } else if (startDate != null && endDate != null) {
            response = timeOffRequestService.getTimeOffRequestsByDateRange(startDate, endDate);
        } else {
            response = timeOffRequestService.getAllTimeOffRequests(pageable);
        }
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/requests/pending/count")
    public ResponseEntity<ApiResponse<Long>> getPendingReviewsCount() {
        Long count = timeOffRequestService.getPendingReviewsCount(getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PutMapping("/requests/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelTimeOffRequest(@PathVariable Long id) {
        timeOffRequestService.cancelTimeOffRequest(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            // Extract user ID from username or principal
            // For now, we'll need to get the user ID from the user service
            // This is a temporary solution - in a real implementation, you'd store the user ID in the JWT token
            return 1L; // TODO: Implement proper user ID extraction
        }
        throw new RuntimeException("User not authenticated");
    }
}
