package com.afyaquik.hms.reference.api;

import com.afyaquik.hms.auth.repository.DepartmentRepository;
import com.afyaquik.hms.auth.repository.StaffRoleRepository;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reference")
@PreAuthorize("isAuthenticated()")
public class ReferenceController {

    private final StaffRoleRepository staffRoleRepository;
    private final DepartmentRepository departmentRepository;

    public ReferenceController(StaffRoleRepository staffRoleRepository, DepartmentRepository departmentRepository) {
        this.staffRoleRepository = staffRoleRepository;
        this.departmentRepository = departmentRepository;
    }

    @GetMapping("/roles")
    public ApiResponse<List<RoleRef>> roles() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        var list = staffRoleRepository.findByTenantIdOrderByDisplayNameAsc(tenantId).stream()
            .map(r -> new RoleRef(r.getRoleKey() == null ? null : r.getRoleKey().toUpperCase(), r.getDisplayName()))
            .toList();
        return ApiResponse.success(list);
    }

    @GetMapping("/departments")
    public ApiResponse<List<DepartmentRef>> departments() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        var list = departmentRepository.findByTenantIdOrderByDisplayNameAsc(tenantId).stream()
            .map(d -> new DepartmentRef(d.getDepartmentId(), d.getDisplayName()))
            .toList();
        return ApiResponse.success(list);
    }

    // Normalized field names so frontend can directly map without translation.
    public record RoleRef(String roleKey, String displayName) {}
    public record DepartmentRef(String departmentId, String displayName) {}
}
