package com.afyaquik.hms.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.common.repository.TenantAwareRepository;

/**
 * Example of how to update StaffUserRepository to use TenantAwareRepository.
 * This shows how all repositories can be made tenant-aware automatically.
 */
public interface StaffUserRepositoryExample extends TenantAwareRepository<StaffUser, Long> {

    // Tenant-aware methods are now available automatically:
    // - findAllForCurrentTenant()
    // - findByIdForCurrentTenant(Long id)
    // - existsByIdForCurrentTenant(Long id)
    // - countForCurrentTenant()
    // - deleteByIdForCurrentTenant(Long id)
    // - deleteAllForCurrentTenant()

    // Custom tenant-aware methods
    @EntityGraph(attributePaths = "roles")
    Optional<StaffUser> findByTenantIdAndUsername(String tenantId, String username);

    @EntityGraph(attributePaths = "roles")
    List<StaffUser> findByTenantId(String tenantId);
    
    // Department queries removed - departments are now managed separately
    
    // These methods should be removed as they're not tenant-aware
    // StaffUser findByUsernameAndDeletedFalse(String username);
    
    @EntityGraph(attributePaths = "roles")
    StaffUser findByTenantIdAndUsernameAndDeletedFalse(String tenantId, String username);
    
    List<StaffUser> findBySupervisorIdAndDeletedFalse(Long supervisorId);
    
    // New tenant-aware methods
    @EntityGraph(attributePaths = "roles")
    default Optional<StaffUser> findByUsernameForCurrentTenant(String username) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndUsername(tenantId, username);
    }
    
    @EntityGraph(attributePaths = "roles")
    default StaffUser findByUsernameAndDeletedFalseForCurrentTenant(String username) {
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndUsernameAndDeletedFalse(tenantId, username);
    }
}
