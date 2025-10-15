package com.afyaquik.hms.configuration.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import com.afyaquik.hms.configuration.domain.FeatureFlag;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeatureFlagRepository extends TenantAwareRepository<FeatureFlag, Long> {
    List<FeatureFlag> findByTenantIdOrderByFlagKeyAsc(String tenantId);
    Optional<FeatureFlag> findByTenantIdAndFlagKey(String tenantId, String flagKey);
}
