package com.afyaquik.hms.admin.api;

import com.afyaquik.hms.admin.dto.CreateUserRequest;
import com.afyaquik.hms.admin.dto.UpdateUserRequest;
import com.afyaquik.hms.admin.dto.UpdateUserRolesRequest;
import com.afyaquik.hms.admin.dto.UserDto;
import com.afyaquik.hms.admin.service.AdminUserService;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderResolver;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
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
    public ApiResponse<UserDto> create(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @Valid @RequestBody CreateUserRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return ApiResponse.success(userService.create(tenantId, request));
    }

    @PutMapping("/{id}")
    public ApiResponse<UserDto> update(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return ApiResponse.success(userService.update(tenantId, id, request));
    }

    @PatchMapping("/{id}/roles")
    public ApiResponse<UserDto> updateRoles(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRolesRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return ApiResponse.success(userService.updateRoles(tenantId, id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @PathVariable Long id) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        userService.softDelete(tenantId, id);
        return ApiResponse.success(null);
    }
}
