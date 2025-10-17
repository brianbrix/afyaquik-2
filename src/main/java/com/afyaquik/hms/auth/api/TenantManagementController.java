package com.afyaquik.hms.auth.api;

import com.afyaquik.hms.auth.domain.Tenant;
import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.service.TenantManagementService;
import com.afyaquik.hms.auth.dto.TenantDto;
import com.afyaquik.hms.auth.dto.CreateTenantRequest;
import com.afyaquik.hms.auth.dto.CreateAdminUserRequest;
import com.afyaquik.hms.common.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/super-admin/tenants")
@RequiredArgsConstructor
@Slf4j
public class TenantManagementController {

    private final TenantManagementService tenantManagementService;

    /**
     * Get all tenants
     */
    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<TenantDto>>> getAllTenants() {
        try {
            List<Tenant> tenants = tenantManagementService.getAllTenants();
            List<TenantDto> tenantDtos = tenants.stream()
                    .map(tenantManagementService::toDto)
                    .toList();
            return ResponseEntity.ok(ApiResponse.success(tenantDtos));
        } catch (Exception e) {
            log.error("Error fetching tenants", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch tenants: " + e.getMessage()));
        }
    }

    /**
     * Get active tenants
     */
    @GetMapping("/active")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<TenantDto>>> getActiveTenants() {
        try {
            List<Tenant> tenants = tenantManagementService.getActiveTenants();
            List<TenantDto> tenantDtos = tenants.stream()
                    .map(tenantManagementService::toDto)
                    .toList();
            return ResponseEntity.ok(ApiResponse.success(tenantDtos));
        } catch (Exception e) {
            log.error("Error fetching active tenants", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch active tenants: " + e.getMessage()));
        }
    }

    /**
     * Get tenant by code
     */
    @GetMapping("/{tenantCode}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TenantDto>> getTenant(@PathVariable String tenantCode) {
        try {
            return tenantManagementService.getTenantByCode(tenantCode)
                    .map(tenant -> ResponseEntity.ok(ApiResponse.success(tenantManagementService.toDto(tenant))))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching tenant: {}", tenantCode, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch tenant: " + e.getMessage()));
        }
    }

    /**
     * Create new tenant
     */
    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TenantDto>> createTenant(@RequestBody CreateTenantRequest request) {
        try {
            Tenant tenant = tenantManagementService.createTenant(request);
            return ResponseEntity.ok(ApiResponse.success(tenantManagementService.toDto(tenant)));
        } catch (Exception e) {
            log.error("Error creating tenant", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create tenant: " + e.getMessage()));
        }
    }

    /**
     * Update tenant
     */
    @PutMapping("/{tenantCode}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TenantDto>> updateTenant(
            @PathVariable String tenantCode,
            @RequestBody CreateTenantRequest request) {
        try {
            Tenant tenant = tenantManagementService.updateTenant(tenantCode, request);
            return ResponseEntity.ok(ApiResponse.success(tenantManagementService.toDto(tenant)));
        } catch (Exception e) {
            log.error("Error updating tenant: {}", tenantCode, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to update tenant: " + e.getMessage()));
        }
    }

    /**
     * Deactivate tenant
     */
    @DeleteMapping("/{tenantCode}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateTenant(@PathVariable String tenantCode) {
        try {
            tenantManagementService.deactivateTenant(tenantCode);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            log.error("Error deactivating tenant: {}", tenantCode, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to deactivate tenant: " + e.getMessage()));
        }
    }

    /**
     * Get tenant statistics
     */
    @GetMapping("/{tenantCode}/stats")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TenantManagementService.TenantStats>> getTenantStats(@PathVariable String tenantCode) {
        try {
            TenantManagementService.TenantStats stats = tenantManagementService.getTenantStats(tenantCode);
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            log.error("Error fetching tenant stats: {}", tenantCode, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch tenant stats: " + e.getMessage()));
        }
    }

    /**
     * Get users for a tenant
     */
    @GetMapping("/{tenantCode}/users")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<StaffUser>>> getTenantUsers(@PathVariable String tenantCode) {
        try {
            List<StaffUser> users = tenantManagementService.getUsersForTenant(tenantCode);
            return ResponseEntity.ok(ApiResponse.success(users));
        } catch (Exception e) {
            log.error("Error fetching tenant users: {}", tenantCode, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch tenant users: " + e.getMessage()));
        }
    }

    /**
     * Create admin user for a tenant
     */
    @PostMapping("/{tenantCode}/admin-users")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<StaffUser>> createAdminUser(
            @PathVariable String tenantCode,
            @RequestBody CreateAdminUserRequest request) {
        try {
            // Ensure the request tenant code matches the path
            CreateAdminUserRequest requestWithTenant = new CreateAdminUserRequest(
                    request.username(),
                    request.displayName(),
                    request.email(),
                    request.password(),
                    tenantCode, // Use the tenant from the path
                    request.roleKey(),
                    request.department(),
                    request.phone(),
                    request.notes()
            );
            
            StaffUser user = tenantManagementService.createAdminUser(requestWithTenant);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (Exception e) {
            log.error("Error creating admin user for tenant: {}", tenantCode, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create admin user: " + e.getMessage()));
        }
    }
}
