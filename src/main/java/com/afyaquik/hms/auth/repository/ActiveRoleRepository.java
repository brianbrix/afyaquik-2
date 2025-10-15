package com.afyaquik.hms.auth.repository;

import com.afyaquik.hms.auth.domain.ActiveRole;
import com.afyaquik.hms.common.repository.TenantAwareRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActiveRoleRepository extends TenantAwareRepository<ActiveRole, Long> {
    
    Optional<ActiveRole> findByTenantIdAndUserId(String tenantId, Long userId);
    
    Optional<ActiveRole> findByTenantIdAndUserIdAndDeletedFalse(String tenantId, Long userId);
    
    void deleteByTenantIdAndUserId(String tenantId, Long userId);
}
