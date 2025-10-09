package com.afyaquik.hms.admin.api;

import com.afyaquik.hms.admin.dto.CreateDepartmentRequest;
import com.afyaquik.hms.admin.dto.DepartmentDto;
import com.afyaquik.hms.admin.dto.UpdateDepartmentRequest;
import com.afyaquik.hms.admin.service.AdminDepartmentService;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderResolver;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/departments")
public class AdminDepartmentController {

    private final AdminDepartmentService departmentService;

    public AdminDepartmentController(AdminDepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public ApiResponse<List<DepartmentDto>> list(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return ApiResponse.success(departmentService.list(tenantId));
    }

    @PostMapping
    public ApiResponse<DepartmentDto> create(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @Valid @RequestBody CreateDepartmentRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return ApiResponse.success(departmentService.create(tenantId, request));
    }

    @PutMapping("/{id}")
    public ApiResponse<DepartmentDto> update(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @PathVariable Long id,
            @Valid @RequestBody UpdateDepartmentRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        return ApiResponse.success(departmentService.update(tenantId, id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @PathVariable Long id) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        departmentService.softDelete(tenantId, id);
        return ApiResponse.success(null);
    }
}
