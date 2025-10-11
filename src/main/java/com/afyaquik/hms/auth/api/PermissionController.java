package com.afyaquik.hms.auth.api;

import com.afyaquik.hms.auth.domain.Permission;
import com.afyaquik.hms.auth.domain.PermissionAssignment;
import com.afyaquik.hms.auth.dto.PermissionMatrixDto;
import com.afyaquik.hms.auth.dto.PermissionAssignmentDto;
import com.afyaquik.hms.auth.service.PermissionService;
import java.util.List;


import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.afyaquik.hms.auth.security.TenantUserDetails;
import com.afyaquik.hms.auth.service.ActiveRoleService;
import com.afyaquik.hms.common.web.TenantHeaderResolver;


@RestController
@RequestMapping("/api/v1/permissions")
public class PermissionController {
    private final PermissionService permissionService;
    private final ActiveRoleService activeRoleService;

    public PermissionController(PermissionService permissionService, ActiveRoleService activeRoleService) {
        this.permissionService = permissionService;
        this.activeRoleService = activeRoleService;
    }

    @GetMapping
    public List<Permission> listPermissions() {
        return permissionService.findAllPermissions();
    }

    @PostMapping
    public Permission createPermission(@RequestBody Permission permission) {
        return permissionService.savePermission(permission);
    }

    @GetMapping("/assignments")
    public List<PermissionAssignmentDto> listAssignments(@RequestParam PermissionAssignment.TargetType targetType, @RequestParam Long targetId) {
        return permissionService.findAssignmentDtos(targetType, targetId);
    }

    @PostMapping("/assignments")
    public ResponseEntity<?> createAssignment(@RequestBody PermissionAssignment assignment) {
        String code = assignment.getPermission() != null ? assignment.getPermission().getCode() : null;
        if (code == null) {
            return ResponseEntity.badRequest().body("Permission code is required");
        }
        return permissionService.findPermissionByCode(code)
            .<ResponseEntity<?>>map(permission -> {
                assignment.setPermission(permission);
                return ResponseEntity.ok(permissionService.saveAssignment(assignment));
            })
            .orElseGet(() -> ResponseEntity.badRequest().body("Permission not found: " + code));
    }
        @GetMapping("/matrix")
    public PermissionMatrixDto getMatrix(@RequestParam PermissionAssignment.TargetType targetType, @RequestParam Long targetId) {
        return permissionService.getMatrix(targetType, targetId);
    }

    @GetMapping("/resolve")
    public PermissionMatrixDto resolvePermissions(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            Authentication authentication) {
        return permissionService.resolvePermissionsForSession(tenantHeader, authentication);
    }

    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        permissionService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }
}
