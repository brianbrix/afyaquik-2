package com.afyaquik.hms.auth.api;

import com.afyaquik.hms.auth.domain.Permission;
import com.afyaquik.hms.auth.domain.PermissionAssignment;
import com.afyaquik.hms.auth.dto.PermissionMatrixDto;
import com.afyaquik.hms.auth.dto.PermissionAssignmentDto;
import com.afyaquik.hms.auth.dto.UpsertPermissionAssignmentRequest;
import com.afyaquik.hms.auth.dto.PermissionDto;
import com.afyaquik.hms.auth.dto.PermissionAssignmentResponseDto;
import com.afyaquik.hms.auth.service.PermissionService;
import java.util.List;


import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.afyaquik.hms.common.web.TenantHeaderResolver;


@RestController
@RequestMapping("/api/v1/permissions")
public class PermissionController {
    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping
    public List<PermissionDto> listPermissions() {
        return permissionService.findAllPermissionDtos();
    }

    @PostMapping
    public PermissionDto createPermission(@RequestBody Permission permission) {
        Permission savedPermission = permissionService.savePermission(permission);
        return new PermissionDto(
            savedPermission.getId(),
            savedPermission.getCode(),
            savedPermission.getDescription()
        );
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
                PermissionAssignment savedAssignment = permissionService.saveAssignment(assignment);
                // Use safe conversion to avoid LazyInitializationException
                PermissionAssignmentResponseDto responseDto = new PermissionAssignmentResponseDto(
                    savedAssignment.getId(),
                    savedAssignment.getTargetType().name(),
                    savedAssignment.getTargetId(),
                    code, // Use the code we already have
                    permission.getDescription(), // Use the permission we already fetched
                    savedAssignment.getState().name()
                );
                return ResponseEntity.ok(responseDto);
            })
            .orElseGet(() -> ResponseEntity.badRequest().body("Permission not found: " + code));
    }

    @PostMapping("/assignments/upsert")
    public ResponseEntity<?> upsertAssignment(@RequestBody UpsertPermissionAssignmentRequest request) {
        try {
            PermissionAssignmentResponseDto assignment = permissionService.upsertAssignment(
                request.getPermissionCode(),
                request.getTargetType(),
                request.getTargetId(),
                request.getState()
            );
            return ResponseEntity.ok(assignment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to upsert assignment: " + e.getMessage());
        }
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
