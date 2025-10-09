package com.afyaquik.hms.admin.api;

import com.afyaquik.hms.admin.dto.CreateRoleRequest;
import com.afyaquik.hms.admin.dto.RoleDto;
import com.afyaquik.hms.admin.dto.UpdateRoleRequest;
import com.afyaquik.hms.admin.service.AdminRoleService;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderResolver;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/roles")
public class AdminRoleController {

    private final AdminRoleService roleService;

    public AdminRoleController(AdminRoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    public ApiResponse<List<RoleDto>> list(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return ApiResponse.success(roleService.list(tenantId));
    }

    @PostMapping
    public ApiResponse<RoleDto> create(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @Valid @RequestBody CreateRoleRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return ApiResponse.success(roleService.create(tenantId, request));
    }

    @PutMapping("/{id}")
    public ApiResponse<RoleDto> update(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return ApiResponse.success(roleService.update(tenantId, id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @PathVariable Long id) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        roleService.softDelete(tenantId, id);
        return ApiResponse.success(null);
    }
}
