package com.afyaquik.hms.configuration.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import com.afyaquik.hms.configuration.domain.TenantTheme;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantThemeRepository extends TenantAwareRepository<TenantTheme, Long> {
    Optional<TenantTheme> findFirstByTenantId(String tenantId);
}
