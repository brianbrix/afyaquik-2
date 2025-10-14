package com.afyaquik.hms.profile.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.profile.domain.UserProfile;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    
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
}
