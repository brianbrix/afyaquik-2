package com.afyaquik.hms.auth.api;

import com.afyaquik.hms.auth.security.TenantUserDetails;
import com.afyaquik.hms.auth.service.ActiveRoleService;
import com.afyaquik.hms.auth.service.PermissionService;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderResolver;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class ActiveRoleController {

    private final ActiveRoleService activeRoleService;
    private final PermissionService permissionService;

    public ActiveRoleController(ActiveRoleService activeRoleService, PermissionService permissionService) {
        this.activeRoleService = activeRoleService;
        this.permissionService = permissionService;
    }

    @PostMapping("/active-role")
    public ApiResponse<ActiveRoleResponse> setActiveRole(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenant,
            Authentication authentication,
            @Valid @RequestBody ActiveRoleRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenant);
        if (tenantId == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "X-Tenant-Id header is required");
        }
        TenantUserDetails principal = (TenantUserDetails) authentication.getPrincipal();
        if (!principal.getUser().getTenantId().equals(tenantId)) {
            throw new org.springframework.security.access.AccessDeniedException("Tenant mismatch");
        }
        String userId = principal.getUser().getId().toString();
        
        // Find the role details from user's roles
        String roleName = "Unknown Role";
        String roleDescription = "No description available";
        
        for (var role : principal.getUser().getRoles()) {
            if (role.getRoleKey().equals(request.role())) {
                roleName = role.getDisplayName();
                roleDescription = "Role: " + role.getDisplayName();
                break;
            }
        }
        
        activeRoleService.setActiveRole(tenantId, userId, request.role(), roleName, roleDescription);
        
        return ApiResponse.success(new ActiveRoleResponse(request.role()));
    }

    @GetMapping("/active-role")
    public ResponseEntity<ApiResponse<ActiveRoleResponse>> getActiveRole(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenant,
            Authentication authentication) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenant);
        if (tenantId == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "X-Tenant-Id header is required");
        }
        TenantUserDetails principal = (TenantUserDetails) authentication.getPrincipal();
        if (!principal.getUser().getTenantId().equals(tenantId)) {
            throw new org.springframework.security.access.AccessDeniedException("Tenant mismatch");
        }
        String userId = principal.getUser().getId().toString();
        
        return activeRoleService
                .getActiveRole(tenantId, userId)
                .map(role -> {
                    // Resolve permissions for the active role
                    try {
                        permissionService.resolvePermissions(principal.getUser().getId(), 
                            principal.getUser().getRoles().stream()
                                .filter(r -> r.getRoleKey().equals(role))
                                .findFirst()
                                .map(r -> r.getId())
                                .orElse(null));
                    } catch (Exception e) {
                        // Log error but don't fail the request
                        System.err.println("Failed to resolve permissions for active role: " + e.getMessage());
                    }
                    
                    return ResponseEntity.ok(ApiResponse.success(new ActiveRoleResponse(role)));
                })
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
