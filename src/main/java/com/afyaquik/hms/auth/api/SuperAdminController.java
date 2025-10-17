package com.afyaquik.hms.auth.api;

import com.afyaquik.hms.auth.domain.SuperAdminUser;
import com.afyaquik.hms.auth.service.SuperAdminService;
import com.afyaquik.hms.common.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/super-admin")
@RequiredArgsConstructor
@Slf4j
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    /**
     * Get all super admin users
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<SuperAdminUser>>> getAllSuperAdminUsers() {
        try {
            List<SuperAdminUser> users = superAdminService.getAllSuperAdminUsers();
            return ResponseEntity.ok(ApiResponse.success(users));
        } catch (Exception e) {
            log.error("Error fetching super admin users", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch super admin users: " + e.getMessage()));
        }
    }

    /**
     * Get active super admin users
     */
    @GetMapping("/users/active")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<SuperAdminUser>>> getActiveSuperAdminUsers() {
        try {
            List<SuperAdminUser> users = superAdminService.getActiveSuperAdminUsers();
            return ResponseEntity.ok(ApiResponse.success(users));
        } catch (Exception e) {
            log.error("Error fetching active super admin users", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch active super admin users: " + e.getMessage()));
        }
    }

    /**
     * Create a new super admin user
     */
    @PostMapping("/users")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<SuperAdminUser>> createSuperAdminUser(
            @RequestBody CreateSuperAdminUserRequest request) {
        try {
            SuperAdminUser user = superAdminService.createSuperAdminUser(
                    request.username(),
                    request.displayName(),
                    request.email(),
                    request.password()
            );
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (Exception e) {
            log.error("Error creating super admin user", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create super admin user: " + e.getMessage()));
        }
    }

    /**
     * Update super admin user
     */
    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<SuperAdminUser>> updateSuperAdminUser(
            @PathVariable Long id,
            @RequestBody UpdateSuperAdminUserRequest request) {
        try {
            SuperAdminUser user = superAdminService.updateSuperAdminUser(
                    id,
                    request.displayName(),
                    request.email(),
                    request.password(),
                    request.isActive()
            );
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (Exception e) {
            log.error("Error updating super admin user", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update super admin user: " + e.getMessage()));
        }
    }

    /**
     * Deactivate super admin user
     */
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateSuperAdminUser(@PathVariable Long id) {
        try {
            superAdminService.deactivateSuperAdminUser(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            log.error("Error deactivating super admin user", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to deactivate super admin user: " + e.getMessage()));
        }
    }


    /**
     * Check if current user is super admin
     */
    @GetMapping("/check-access")
    public ResponseEntity<ApiResponse<Boolean>> checkSuperAdminAccess() {
        try {
            boolean isSuperAdmin = superAdminService.isCurrentUserSuperAdmin();
            return ResponseEntity.ok(ApiResponse.success(isSuperAdmin));
        } catch (Exception e) {
            log.error("Error checking super admin access", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to check super admin access: " + e.getMessage()));
        }
    }

    // Request DTOs
    public record CreateSuperAdminUserRequest(
            String username,
            String displayName,
            String email,
            String password
    ) {}

    public record UpdateSuperAdminUserRequest(
            String displayName,
            String email,
            String password,
            Boolean isActive
    ) {}
}
