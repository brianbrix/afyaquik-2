package com.afyaquik.hms.auth.repository;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StaffUserRepository extends TenantAwareRepository<StaffUser, Long> {

    @EntityGraph(attributePaths = "roles")
    Optional<StaffUser> findByTenantIdAndUsername(String tenantId, String username);

    @EntityGraph(attributePaths = "roles")
    List<StaffUser> findByTenantId(String tenantId);
    @Query("SELECT u FROM StaffUser u LEFT JOIN FETCH u.departments WHERE u.tenantId = :tenantId")
    List<StaffUser> findByTenantIdWithDepartments(@Param("tenantId") String tenantId);
    
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
    
    @Query("SELECT u FROM StaffUser u LEFT JOIN FETCH u.departments WHERE u.tenantId = :tenantId")
    default List<StaffUser> findAllForCurrentTenantWithDepartments() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdWithDepartments(tenantId);
    }
    
    @EntityGraph(attributePaths = "roles")
    default StaffUser findByUsernameAndDeletedFalseForCurrentTenant(String username) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndUsernameAndDeletedFalse(tenantId, username);
    }

    // Dashboard methods
    long countByTenantIdAndDeletedFalse(String tenantId);
    long countForCurrentTenant();
}
