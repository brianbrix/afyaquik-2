package com.afyaquik.hms.team.controller;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.team.service.TeamManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for team management functionality.
 * Only accessible to users who are supervisors (have supervised users).
 */
@RestController
@RequestMapping("/api/v1/team")
public class TeamManagementController {

    private final TeamManagementService teamManagementService;

    public TeamManagementController(TeamManagementService teamManagementService) {
        this.teamManagementService = teamManagementService;
    }

    /**
     * Get team members (users where current user is supervisor).
     * This endpoint is protected by @PreAuthorize to ensure only supervisors can access it.
     */
    @GetMapping("/members")
    @PreAuthorize("hasPermission(null,'isSupervisor')")
    public ApiResponse<List<TeamManagementService.TeamMemberDto>> getTeamMembers(Authentication authentication) {
        String username = authentication.getName();
        List<TeamManagementService.TeamMemberDto> teamMembers = teamManagementService.getTeamMembers(username);
        return ApiResponse.success(teamMembers);
    }
    
    /**
     * Get pending time-off requests for team members.
     */
    @PreAuthorize("hasPermission(null,'isSupervisor')")
    @GetMapping("/time-off/requests/pending")
    public ApiResponse<List<TeamManagementService.TimeOffRequestDto>> getPendingTimeOffRequests(
            Authentication authentication) {
        
        String username = authentication.getName();
        List<TeamManagementService.TimeOffRequestDto> requests = teamManagementService.getPendingTimeOffRequests(username);
        return ApiResponse.success(requests);
    }
    
    /**
     * Get pending shift swap requests for team members.
     */
    @PreAuthorize("hasPermission(null,'isSupervisor')")
    @GetMapping("/shift-swaps/requests/pending")
    public ApiResponse<List<TeamManagementService.ShiftSwapRequestDto>> getPendingShiftSwapRequests(
            Authentication authentication) {
        
        String username = authentication.getName();
        List<TeamManagementService.ShiftSwapRequestDto> requests = teamManagementService.getPendingShiftSwapRequests(username);
        return ApiResponse.success(requests);
    }
    
    /**
     * Approve or reject a time-off request.
     */
    @PreAuthorize("hasPermission(null,'isSupervisor')")
    @PostMapping("/time-off/requests/{requestId}/review")
    public ApiResponse<Void> reviewTimeOffRequest(
            Authentication authentication,
            @PathVariable Long requestId,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        
        try {
            String username = authentication.getName();
            teamManagementService.reviewTimeOffRequest(username, requestId, status, notes);
            return ApiResponse.success(null);
        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * Approve or reject a shift swap request.
     */
    @PreAuthorize("hasPermission(null,'isSupervisor')")
    @PostMapping("/shift-swaps/requests/{shiftId}/review")
    public ApiResponse<Void> reviewShiftSwapRequest(
            Authentication authentication,
            @PathVariable Long shiftId,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        
        try {
            String username = authentication.getName();
            teamManagementService.reviewShiftSwapRequest(username, shiftId, status, notes);
            return ApiResponse.success(null);
        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage());
        }
    }
    
    /**
     * Get pending counts for dashboard.
     */
    @PreAuthorize("hasPermission(null,'isSupervisor')")
    @GetMapping("/pending-counts")
    public ApiResponse<TeamManagementService.PendingCountsDto> getPendingCounts(Authentication authentication) {
        String username = authentication.getName();
        TeamManagementService.PendingCountsDto counts = teamManagementService.getPendingCounts(username);
        return ApiResponse.success(counts);
    }
}
