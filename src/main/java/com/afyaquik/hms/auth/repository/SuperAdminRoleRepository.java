package com.afyaquik.hms.auth.repository;

import com.afyaquik.hms.auth.domain.SuperAdminRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SuperAdminRoleRepository extends JpaRepository<SuperAdminRole, Long> {
    
    Optional<SuperAdminRole> findByRoleKey(String roleKey);
    
    boolean existsByRoleKey(String roleKey);
}
