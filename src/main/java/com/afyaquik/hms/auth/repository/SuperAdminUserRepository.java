package com.afyaquik.hms.auth.repository;

import com.afyaquik.hms.auth.domain.SuperAdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SuperAdminUserRepository extends JpaRepository<SuperAdminUser, Long> {
    
    Optional<SuperAdminUser> findByUsername(String username);
    
    Optional<SuperAdminUser> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    List<SuperAdminUser> findByIsActiveTrue();
    
    @Query("SELECT u FROM SuperAdminUser u WHERE u.isActive = true AND (u.lockedUntil IS NULL OR u.lockedUntil < CURRENT_TIMESTAMP)")
    List<SuperAdminUser> findActiveUnlockedUsers();
    
    @Query("SELECT u FROM SuperAdminUser u WHERE u.lastLoginAt >= :since")
    List<SuperAdminUser> findUsersLoggedInSince(@Param("since") java.time.LocalDateTime since);
}
