package com.afyaquik.hms.team.service;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.scheduling.domain.TimeOffRequest;
import com.afyaquik.hms.scheduling.domain.TimeOffStatus;
import com.afyaquik.hms.scheduling.domain.StaffShift;
import com.afyaquik.hms.scheduling.domain.ShiftStatus;
import com.afyaquik.hms.scheduling.repository.TimeOffRequestRepository;
import com.afyaquik.hms.scheduling.repository.StaffShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TeamManagementService {

    @Autowired
    private StaffUserRepository staffUserRepository;
    
    @Autowired
    private TimeOffRequestRepository timeOffRequestRepository;
    
    @Autowired
    private StaffShiftRepository staffShiftRepository;

    /**
     * Get team members for a supervisor.
     */
    @Transactional(readOnly = true)
    public List<TeamMemberDto> getTeamMembers(String supervisorUsername) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        StaffUser supervisor = staffUserRepository.findByTenantIdAndUsernameAndDeletedFalse(tenantId, supervisorUsername);
        if (supervisor == null) {
            return List.of();
        }
        
        List<StaffUser> teamMembers = staffUserRepository.findBySupervisorIdAndDeletedFalse(supervisor.getId());
        return teamMembers.stream()
            .map(this::convertToTeamMemberDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get pending time-off requests for team members with pagination.
     */
    @Transactional(readOnly = true)
    public List<TimeOffRequestDto> getPendingTimeOffRequests(String supervisorUsername) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        StaffUser supervisor = staffUserRepository.findByTenantIdAndUsernameAndDeletedFalse(tenantId, supervisorUsername);
        if (supervisor == null) {
            return new ArrayList<>();
        }
        
        List<Long> teamMemberIds = getTeamMemberIds(supervisor.getId());
        if (teamMemberIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<TimeOffRequest> requests = timeOffRequestRepository.findByUserIdInAndStatusOrderByCreatedAtDesc(
            teamMemberIds, TimeOffStatus.PENDING);
        
        return requests.stream()
            .map(this::convertToTimeOffRequestDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Get pending shift swap requests for team members with pagination.
     */
    @Transactional(readOnly = true)
    public List<ShiftSwapRequestDto> getPendingShiftSwapRequests(String supervisorUsername) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        StaffUser supervisor = staffUserRepository.findByTenantIdAndUsernameAndDeletedFalse(tenantId, supervisorUsername);
        if (supervisor == null) {
            return new ArrayList<>();
        }

        List<Long> teamMemberIds = getTeamMemberIds(supervisor.getId());
        if (teamMemberIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<StaffShift> shifts = staffShiftRepository.findByStaffUserIdInAndStatusOrderByCreatedAtDesc(
            teamMemberIds, ShiftStatus.SWAP_REQUESTED);
        
        return shifts.stream()
            .map(this::convertToShiftSwapRequestDto)
            .collect(Collectors.toList());
    }
    
    /**
     * Review a time-off request (approve or reject).
     */
    public void reviewTimeOffRequest(String supervisorUsername, Long requestId, String status, String notes) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        StaffUser supervisor = staffUserRepository.findByTenantIdAndUsernameAndDeletedFalse(tenantId, supervisorUsername);
        if (supervisor == null) {
            throw new RuntimeException("Supervisor not found");
        }
        
        TimeOffRequest request = timeOffRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Time-off request not found"));
        
        // Verify that the request is from a team member
        if (!isTeamMember(supervisor.getId(), request.getUserId())) {
            throw new RuntimeException("You can only review requests from your team members");
        }
        
        // Update the request status
        if ("APPROVED".equals(status)) {
            request.setStatus(TimeOffStatus.APPROVED);
        } else if ("REJECTED".equals(status)) {
            request.setStatus(TimeOffStatus.REJECTED);
        } else {
            throw new RuntimeException("Invalid status. Use 'APPROVED' or 'REJECTED'");
        }
        
        request.setReviewedBy(supervisor.getId());
        request.setReviewerDisplayName(supervisor.getDisplayName());
        request.setReviewNotes(notes);
        
        timeOffRequestRepository.save(request);
    }
    
    /**
     * Review a shift swap request (approve or reject).
     */
    public void reviewShiftSwapRequest(String supervisorUsername, Long shiftId, String status, String notes) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        StaffUser supervisor = staffUserRepository.findByTenantIdAndUsernameAndDeletedFalse(tenantId, supervisorUsername);
        if (supervisor == null) {
            throw new RuntimeException("Supervisor not found");
        }
        
        StaffShift shift = staffShiftRepository.findById(shiftId)
            .orElseThrow(() -> new RuntimeException("Shift not found"));
        
        // Verify that the shift belongs to a team member
        if (!isTeamMember(supervisor.getId(), shift.getStaffUser().getId())) {
            throw new RuntimeException("You can only review requests from your team members");
        }
        
        // Update the shift status
        if ("APPROVED".equals(status)) {
            // For approved swaps, we might need additional logic to handle the actual swap
            // For now, just change status back to SCHEDULED
            shift.setStatus(ShiftStatus.SCHEDULED);
        } else if ("REJECTED".equals(status)) {
            // For rejected swaps, change status back to SCHEDULED
            shift.setStatus(ShiftStatus.SCHEDULED);
        } else {
            throw new RuntimeException("Invalid status. Use 'APPROVED' or 'REJECTED'");
        }
        
        // Add review notes to the shift notes
        if (notes != null && !notes.trim().isEmpty()) {
            String existingNotes = shift.getNotes();
            String reviewNote = String.format("[Supervisor Review: %s] %s", status, notes);
            shift.setNotes(existingNotes != null ? existingNotes + "\n" + reviewNote : reviewNote);
        }
        
        staffShiftRepository.save(shift);
    }
    
    /**
     * Get pending counts for dashboard.
     */
    @Transactional(readOnly = true)
    public PendingCountsDto getPendingCounts(String supervisorUsername) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        StaffUser supervisor = staffUserRepository.findByTenantIdAndUsernameAndDeletedFalse(tenantId, supervisorUsername);
        if (supervisor == null) {
            return new PendingCountsDto(0, 0);
        }
        
        List<Long> teamMemberIds = getTeamMemberIds(supervisor.getId());
        if (teamMemberIds.isEmpty()) {
            return new PendingCountsDto(0, 0);
        }
        
        long timeOffCount = timeOffRequestRepository.countByUserIdInAndStatus(
            teamMemberIds, TimeOffStatus.PENDING);
        long shiftSwapCount = staffShiftRepository.countByStaffUserIdInAndStatus(
            teamMemberIds, ShiftStatus.SWAP_REQUESTED);
        
        return new PendingCountsDto(timeOffCount, shiftSwapCount);
    }
    
    // Helper methods
    private List<Long> getTeamMemberIds(Long supervisorId) {
        return staffUserRepository.findBySupervisorIdAndDeletedFalse(supervisorId)
            .stream()
            .map(StaffUser::getId)
            .collect(Collectors.toList());
    }
    
    private boolean isTeamMember(Long supervisorId, Long userId) {
        return staffUserRepository.findBySupervisorIdAndDeletedFalse(supervisorId)
            .stream()
            .anyMatch(member -> member.getId().equals(userId));
    }
    
    // Conversion methods
    private TeamMemberDto convertToTeamMemberDto(StaffUser user) {
        List<String> roles = user.getRoles().stream()
            .map(role -> role.getDisplayName())
            .collect(Collectors.toList());
        
        return new TeamMemberDto(
            user.getId(),
            user.getUsername(),
            user.getDisplayName(),
            user.getEmail(),
            roles,
            List.of(), // Add departments if available
            user.isEnabled()
        );
    }
    
    private TimeOffRequestDto convertToTimeOffRequestDto(TimeOffRequest request) {
        // Get user display name
        String userDisplayName = "Unknown User";
        try {
            StaffUser user = staffUserRepository.findById(request.getUserId()).orElse(null);
            if (user != null) {
                userDisplayName = user.getDisplayName();
            }
        } catch (Exception e) {
            // Use default if user not found
        }
        
        // Calculate total days
        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(
            request.getStartDate(), 
            request.getEndDate()
        ) + 1;
        
        return new TimeOffRequestDto(
            request.getId(),
            request.getUserId(),
            userDisplayName,
            request.getRequestType().name(),
            request.getStartDate().toString(),
            request.getEndDate().toString(),
            totalDays,
            request.getReason(),
            request.getStatus().name(),
            request.getCreatedAt() != null ? request.getCreatedAt().toString() : null,
            request.getEmergencyContact(),
            request.getEmergencyPhone(),
            request.getReviewedBy(),
            request.getReviewerDisplayName(),
            request.getReviewNotes()
        );
    }
    
    private ShiftSwapRequestDto convertToShiftSwapRequestDto(StaffShift shift) {
        // Get requester display name
        String requesterDisplayName = "Unknown User";
        try {
            if (shift.getStaffUser() != null) {
                requesterDisplayName = shift.getStaffUser().getDisplayName();
            }
        } catch (Exception e) {
            // Use default if user not found
        }
        
        return new ShiftSwapRequestDto(
            shift.getId(),
            shift.getStaffUser() != null ? shift.getStaffUser().getId() : null,
            requesterDisplayName,
            null, // No target user for basic swap requests
            null, // No target user display name for basic swap requests
            shift.getId(), // Original shift ID
            null, // No target shift ID for basic swap requests
            shift.getNotes(), // Use shift notes as reason
            shift.getStatus().name(),
            shift.getCreatedAt() != null ? shift.getCreatedAt().toString() : null,
            null, // No reviewed by for basic implementation
            null, // No reviewed by name for basic implementation
            null // No review notes for basic implementation
        );
    }
    
    // DTOs
    public static class TeamMemberDto {
        private Long id;
        private String username;
        private String displayName;
        private String email;
        private List<String> roles;
        private List<String> departments;
        private boolean enabled;

        public TeamMemberDto() {}

        public TeamMemberDto(Long id, String username, String displayName, String email, 
                           List<String> roles, List<String> departments, boolean enabled) {
            this.id = id;
            this.username = username;
            this.displayName = displayName;
            this.email = email;
            this.roles = roles;
            this.departments = departments;
            this.enabled = enabled;
        }

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public List<String> getRoles() { return roles; }
        public void setRoles(List<String> roles) { this.roles = roles; }
        
        public List<String> getDepartments() { return departments; }
        public void setDepartments(List<String> departments) { this.departments = departments; }
        
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
    }
    
    public static class TimeOffRequestDto {
        private Long id;
        private Long userId;
        private String userDisplayName;
        private String type;
        private String startDate;
        private String endDate;
        private long totalDays;
        private String reason;
        private String status;
        private String createdAt;
        private String emergencyContact;
        private String emergencyPhone;
        private Long reviewedBy;
        private String reviewedByName;
        private String reviewNotes;

        public TimeOffRequestDto() {}

        public TimeOffRequestDto(Long id, Long userId, String userDisplayName, String type, String startDate, String endDate,
                               long totalDays, String reason, String status, String createdAt, String emergencyContact,
                               String emergencyPhone, Long reviewedBy, String reviewedByName, String reviewNotes) {
            this.id = id;
            this.userId = userId;
            this.userDisplayName = userDisplayName;
            this.type = type;
            this.startDate = startDate;
            this.endDate = endDate;
            this.totalDays = totalDays;
            this.reason = reason;
            this.status = status;
            this.createdAt = createdAt;
            this.emergencyContact = emergencyContact;
            this.emergencyPhone = emergencyPhone;
            this.reviewedBy = reviewedBy;
            this.reviewedByName = reviewedByName;
            this.reviewNotes = reviewNotes;
        }

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public String getUserDisplayName() { return userDisplayName; }
        public void setUserDisplayName(String userDisplayName) { this.userDisplayName = userDisplayName; }
        
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
        
        public long getTotalDays() { return totalDays; }
        public void setTotalDays(long totalDays) { this.totalDays = totalDays; }
        
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        
        public Long getReviewedBy() { return reviewedBy; }
        public void setReviewedBy(Long reviewedBy) { this.reviewedBy = reviewedBy; }
        
        public String getReviewedByName() { return reviewedByName; }
        public void setReviewedByName(String reviewedByName) { this.reviewedByName = reviewedByName; }
        
        public String getReviewNotes() { return reviewNotes; }
        public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
        
        public String getEmergencyContact() { return emergencyContact; }
        public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }
        
        public String getEmergencyPhone() { return emergencyPhone; }
        public void setEmergencyPhone(String emergencyPhone) { this.emergencyPhone = emergencyPhone; }
    }
    
    public static class ShiftSwapRequestDto {
        private Long id;
        private Long requesterId;
        private String requesterDisplayName;
        private Long targetUserId;
        private String targetUserDisplayName;
        private Long originalShiftId;
        private Long targetShiftId;
        private String reason;
        private String status;
        private String createdAt;
        private Long reviewedBy;
        private String reviewedByName;
        private String reviewNotes;

        public ShiftSwapRequestDto() {}

        public ShiftSwapRequestDto(Long id, Long requesterId, String requesterDisplayName, Long targetUserId,
                                 String targetUserDisplayName, Long originalShiftId, Long targetShiftId, 
                                 String reason, String status, String createdAt, Long reviewedBy, 
                                 String reviewedByName, String reviewNotes) {
            this.id = id;
            this.requesterId = requesterId;
            this.requesterDisplayName = requesterDisplayName;
            this.targetUserId = targetUserId;
            this.targetUserDisplayName = targetUserDisplayName;
            this.originalShiftId = originalShiftId;
            this.targetShiftId = targetShiftId;
            this.reason = reason;
            this.status = status;
            this.createdAt = createdAt;
            this.reviewedBy = reviewedBy;
            this.reviewedByName = reviewedByName;
            this.reviewNotes = reviewNotes;
        }

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public Long getRequesterId() { return requesterId; }
        public void setRequesterId(Long requesterId) { this.requesterId = requesterId; }
        
        public String getRequesterDisplayName() { return requesterDisplayName; }
        public void setRequesterDisplayName(String requesterDisplayName) { this.requesterDisplayName = requesterDisplayName; }
        
        public Long getTargetUserId() { return targetUserId; }
        public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }
        
        public String getTargetUserDisplayName() { return targetUserDisplayName; }
        public void setTargetUserDisplayName(String targetUserDisplayName) { this.targetUserDisplayName = targetUserDisplayName; }
        
        public Long getOriginalShiftId() { return originalShiftId; }
        public void setOriginalShiftId(Long originalShiftId) { this.originalShiftId = originalShiftId; }
        
        public Long getTargetShiftId() { return targetShiftId; }
        public void setTargetShiftId(Long targetShiftId) { this.targetShiftId = targetShiftId; }
        
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        
        public Long getReviewedBy() { return reviewedBy; }
        public void setReviewedBy(Long reviewedBy) { this.reviewedBy = reviewedBy; }
        
        public String getReviewedByName() { return reviewedByName; }
        public void setReviewedByName(String reviewedByName) { this.reviewedByName = reviewedByName; }
        
        public String getReviewNotes() { return reviewNotes; }
        public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
    }
    
    public static class PendingCountsDto {
        private long timeOff;
        private long shiftSwaps;

        public PendingCountsDto() {}

        public PendingCountsDto(long timeOff, long shiftSwaps) {
            this.timeOff = timeOff;
            this.shiftSwaps = shiftSwaps;
        }

        public long getTimeOff() { return timeOff; }
        public void setTimeOff(long timeOff) { this.timeOff = timeOff; }
        
        public long getShiftSwaps() { return shiftSwaps; }
        public void setShiftSwaps(long shiftSwaps) { this.shiftSwaps = shiftSwaps; }
    }
}
