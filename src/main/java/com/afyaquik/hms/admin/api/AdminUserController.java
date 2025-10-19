package com.afyaquik.hms.admin.api;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.admin.dto.CreateUserRequest;
import com.afyaquik.hms.admin.dto.UpdateUserRequest;
import com.afyaquik.hms.admin.dto.UpdateUserRolesRequest;
import com.afyaquik.hms.admin.dto.UserDto;
import com.afyaquik.hms.admin.service.AdminUserService;
import com.afyaquik.hms.audit.annotation.Auditable;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderResolver;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin/users")
@Auditable(entityType = "User", description = "User management operations")
public class AdminUserController {

    private final AdminUserService userService;

    public AdminUserController(AdminUserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ApiResponse<List<UserDto>> list(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return ApiResponse.success(userService.list(tenantId));
    }

    @PostMapping
    @Auditable(action = "CREATE_USER", entityType = "User", description = "Create new user")
    public ApiResponse<UserDto> create(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @Valid @RequestBody CreateUserRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return ApiResponse.success(userService.create(tenantId, request));
    }

    @PutMapping("/{id}")
    @Auditable(action = "UPDATE_USER", entityType = "User", entityIdField = "id", description = "Update user information")
    public ApiResponse<UserDto> update(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return ApiResponse.success(userService.update(tenantId, id, request));
    }

    @PatchMapping("/{id}/roles")
    @Auditable(action = "UPDATE_USER_ROLES", entityType = "User", entityIdField = "id", description = "Update user roles")
    public ApiResponse<UserDto> updateRoles(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRolesRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return ApiResponse.success(userService.updateRoles(tenantId, id, request));
    }

    @DeleteMapping("/{id}")
    @Auditable(action = "DELETE_USER", entityType = "User", entityIdField = "id", description = "Delete user")
    public ApiResponse<Void> delete(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @PathVariable Long id) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        userService.softDelete(tenantId, id);
        return ApiResponse.success(null);
    }
}
