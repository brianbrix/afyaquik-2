package com.afyaquik.hms.admin.service;

import com.afyaquik.hms.admin.dto.CreateRoleRequest;
import com.afyaquik.hms.admin.dto.RoleDto;
import com.afyaquik.hms.admin.dto.UpdateRoleRequest;
import com.afyaquik.hms.auth.domain.StaffRole;
import com.afyaquik.hms.auth.repository.StaffRoleRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminRoleService {

    private final StaffRoleRepository roleRepository;
    private final AdminMapper mapper;

    public AdminRoleService(StaffRoleRepository roleRepository, AdminMapper mapper) {
        this.roleRepository = roleRepository;
        this.mapper = mapper;
    }

    public List<RoleDto> list(String tenantId) {
    return roleRepository.findByTenantIdOrderByDisplayNameAsc(tenantId).stream()
        .filter(r -> !r.isDeleted())
        .map(mapper::toDto)
        .collect(Collectors.toList());
    }

    public RoleDto create(String tenantId, CreateRoleRequest req) {
        String upperRoleKey = req.roleKey() == null ? null : req.roleKey().toUpperCase();
        roleRepository.findByTenantIdAndRoleKey(tenantId, upperRoleKey).ifPresent(r -> {
            throw new IllegalArgumentException("Role key already exists");
        });
        StaffRole role = new StaffRole();
        role.setTenantId(tenantId);
        role.setRoleKey(upperRoleKey);
        role.setDisplayName(req.displayName());
        return mapper.toDto(roleRepository.save(role));
    }

    public RoleDto update(String tenantId, Long id, UpdateRoleRequest req) {
        StaffRole role = roleRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
        if (!tenantId.equals(role.getTenantId())) {
            throw new IllegalArgumentException("Tenant mismatch");
        }
        role.setDisplayName(req.displayName());
        return mapper.toDto(roleRepository.save(role));
    }

    public void softDelete(String tenantId, Long id) {
        StaffRole role = roleRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
        if (!tenantId.equals(role.getTenantId())) {
            throw new IllegalArgumentException("Tenant mismatch");
        }
        role.softDelete();
        roleRepository.save(role);
    }
}
