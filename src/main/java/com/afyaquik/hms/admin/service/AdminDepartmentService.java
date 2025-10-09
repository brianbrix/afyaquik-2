package com.afyaquik.hms.admin.service;

import com.afyaquik.hms.admin.dto.CreateDepartmentRequest;
import com.afyaquik.hms.admin.dto.DepartmentDto;
import com.afyaquik.hms.admin.dto.UpdateDepartmentRequest;
import com.afyaquik.hms.auth.domain.Department;
import com.afyaquik.hms.auth.repository.DepartmentRepository;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminDepartmentService {

    private final DepartmentRepository departmentRepository;
    private final AdminMapper mapper;

    public AdminDepartmentService(DepartmentRepository departmentRepository, AdminMapper mapper) {
        this.departmentRepository = departmentRepository;
        this.mapper = mapper;
    }

    public List<DepartmentDto> list(String tenantId) {
    return departmentRepository.findByTenantIdOrderByDisplayNameAsc(tenantId).stream()
        .filter(d -> !d.isDeleted())
        .map(mapper::toDto)
        .collect(Collectors.toList());
    }

    public DepartmentDto create(String tenantId, CreateDepartmentRequest req) {
        departmentRepository.findByTenantIdAndDepartmentId(tenantId, req.departmentId()).ifPresent(d -> {
            throw new IllegalArgumentException("Department id already exists");
        });
        Department d = new Department();
        d.setTenantId(tenantId);
        d.setDepartmentId(req.departmentId());
        d.setDisplayName(req.displayName());
        d.setDescription(req.description());
        return mapper.toDto(departmentRepository.save(d));
    }

    public DepartmentDto update(String tenantId, Long id, UpdateDepartmentRequest req) {
        Department d = departmentRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
        if (!tenantId.equals(d.getTenantId())) {
            throw new IllegalArgumentException("Tenant mismatch");
        }
        d.setDisplayName(req.displayName());
        d.setDescription(req.description());
        return mapper.toDto(departmentRepository.save(d));
    }

    public void softDelete(String tenantId, Long id) {
        Department d = departmentRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
        if (!tenantId.equals(d.getTenantId())) {
            throw new IllegalArgumentException("Tenant mismatch");
        }
        d.softDelete();
        departmentRepository.save(d);
    }
}
