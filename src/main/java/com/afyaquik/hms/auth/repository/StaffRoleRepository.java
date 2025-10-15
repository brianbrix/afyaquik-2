package com.afyaquik.hms.auth.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import com.afyaquik.hms.auth.domain.StaffRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffRoleRepository extends TenantAwareRepository<StaffRole, Long> {

    Optional<StaffRole> findByTenantIdAndRoleKey(String tenantId, String roleKey);
    List<StaffRole> findByTenantIdOrderByDisplayNameAsc(String tenantId);
}
