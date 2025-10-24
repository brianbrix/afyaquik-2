package com.afyaquik.hms.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

public interface StaffUserRepository extends TenantAwareRepository<StaffUser, Long> {

    @EntityGraph(attributePaths = "roles")
    Optional<StaffUser> findByTenantIdAndUsername(String tenantId, String username);

    @EntityGraph(attributePaths = "roles")
    List<StaffUser> findByTenantId(String tenantId);

    @EntityGraph(attributePaths = "roles")
    Page<StaffUser> findByTenantId(String tenantId, Pageable pageable);
    // Department queries removed - departments are now managed separately
    
    StaffUser findByUsernameAndDeletedFalse(String username);
    
    @EntityGraph(attributePaths = "roles")
    StaffUser findByTenantIdAndUsernameAndDeletedFalse(String tenantId, String username);
    
    List<StaffUser> findBySupervisorIdAndDeletedFalse(Long supervisorId);
    
    // Tenant-aware default methods
    @EntityGraph(attributePaths = "roles")
    default Optional<StaffUser> findByUsernameForCurrentTenant(String username) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndUsername(tenantId, username);
    }
    
    @EntityGraph(attributePaths = "roles")
    default List<StaffUser> findAllForCurrentTenantWithRoles() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantId(tenantId);
    }
    
    // Department queries removed - departments are now managed separately
    
    @EntityGraph(attributePaths = "roles")
    default StaffUser findByUsernameAndDeletedFalseForCurrentTenant(String username) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndUsernameAndDeletedFalse(tenantId, username);
    }

    // Dashboard methods
    long countByTenantIdAndDeletedFalse(String tenantId);
    long countForCurrentTenant();
    
    // Analytics methods
    long countByTenantIdAndCreatedAtBetweenAndDeletedFalse(String tenantId, java.time.Instant startDate, java.time.Instant endDate);

    
    @Query("SELECT COUNT(u) FROM StaffUser u WHERE u.enabled = true")
    long countByEnabledTrue();
}
