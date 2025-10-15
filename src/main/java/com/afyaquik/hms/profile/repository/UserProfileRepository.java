package com.afyaquik.hms.profile.repository;

import java.util.Optional;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.profile.domain.UserProfile;

@Repository
public interface UserProfileRepository extends TenantAwareRepository<UserProfile, Long> {
    
    Optional<UserProfile> findByUsername(String username);
    
    Optional<UserProfile> findByEmail(String email);
    
    Optional<UserProfile> findByEmployeeId(String employeeId);
    
    @Query("SELECT up FROM UserProfile up WHERE up.username = :username AND up.tenantId = :tenantId")
    Optional<UserProfile> findByUsernameAndTenantId(@Param("username") String username, @Param("tenantId") String tenantId);
    
    @Query("SELECT up FROM UserProfile up WHERE up.email = :email AND up.tenantId = :tenantId")
    Optional<UserProfile> findByEmailAndTenantId(@Param("email") String email, @Param("tenantId") String tenantId);
    
    @Query("SELECT up FROM UserProfile up WHERE up.department = :department AND up.tenantId = :tenantId")
    java.util.List<UserProfile> findByDepartmentAndTenantId(@Param("department") String department, @Param("tenantId") String tenantId);
    
    @Query("SELECT DISTINCT up.department FROM UserProfile up WHERE up.tenantId = :tenantId AND up.department IS NOT NULL ORDER BY up.department")
    java.util.List<String> findDistinctDepartmentsByTenantId(@Param("tenantId") String tenantId);
    
    @Query("SELECT up FROM UserProfile up WHERE up.tenantId = :tenantId ORDER BY up.firstName, up.lastName")
    java.util.List<UserProfile> findAllByTenantIdOrderByName(@Param("tenantId") String tenantId);
    
    // Tenant-aware default methods
    default Optional<UserProfile> findByUsernameForCurrentTenant(String username) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByUsernameAndTenantId(username, tenantId);
    }
    
    default Optional<UserProfile> findByEmailForCurrentTenant(String email) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByEmailAndTenantId(email, tenantId);
    }
    
    default java.util.List<UserProfile> findByDepartmentForCurrentTenant(String department) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByDepartmentAndTenantId(department, tenantId);
    }
    
    default java.util.List<String> findDistinctDepartmentsForCurrentTenant() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findDistinctDepartmentsByTenantId(tenantId);
    }
    
    default java.util.List<UserProfile> findAllForCurrentTenantOrderByName() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findAllByTenantIdOrderByName(tenantId);
    }
}
