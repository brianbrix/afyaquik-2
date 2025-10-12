package com.afyaquik.hms.configuration.service;

import com.afyaquik.hms.configuration.domain.FeatureFlag;
import com.afyaquik.hms.configuration.repository.FeatureFlagRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class FeatureFlagService {
    private static final Logger log = LoggerFactory.getLogger(FeatureFlagService.class);
    private final FeatureFlagRepository repo;

    public FeatureFlagService(FeatureFlagRepository repo) { this.repo = repo; }

    public List<FeatureFlag> list(String tenantId) {
        log.debug("Listing feature flags for tenant={}", tenantId);
        return repo.findByTenantIdOrderByFlagKeyAsc(tenantId);
    }

    public FeatureFlag upsert(String tenantId, String key, boolean enabled, String description) {
        log.info("Upserting feature flag tenant={} key={} enabled={}", tenantId, key, enabled);
        FeatureFlag flag = repo.findByTenantIdAndFlagKey(tenantId, key).orElseGet(() -> {
            FeatureFlag f = new FeatureFlag();
            f.setTenantId(tenantId);
            f.setFlagKey(key);
            return f;
        });
        flag.setEnabled(enabled);
        flag.setDescription(description);
        FeatureFlag saved = repo.save(flag);
        log.debug("Feature flag upserted id={}", saved.getId());
        return saved;
    }
}
