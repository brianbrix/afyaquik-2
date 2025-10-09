package com.afyaquik.hms.auth.repository;

import com.afyaquik.hms.auth.domain.Department;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByTenantIdAndDepartmentId(String tenantId, String departmentId);
    List<Department> findByTenantIdOrderByDisplayNameAsc(String tenantId);
    boolean existsByTenantId(String tenantId);
    boolean existsByTenantIdAndDepartmentId(String tenantId, String departmentId);
}
