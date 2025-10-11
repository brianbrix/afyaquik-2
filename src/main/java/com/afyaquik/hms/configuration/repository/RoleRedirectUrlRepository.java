package com.afyaquik.hms.configuration.repository;

import com.afyaquik.hms.configuration.domain.RoleRedirectUrl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRedirectUrlRepository extends JpaRepository<RoleRedirectUrl, Long> {
    Optional<RoleRedirectUrl> findByTenantIdAndRoleKey(String tenantId, String roleKey);
    List<RoleRedirectUrl> findByTenantId(String tenantId);
}
