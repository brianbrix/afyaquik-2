package com.afyaquik.hms.configuration.service;

import com.afyaquik.hms.configuration.domain.FeatureFlag;
import com.afyaquik.hms.configuration.repository.FeatureFlagRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class FeatureFlagService {
    private final FeatureFlagRepository repo;

    public FeatureFlagService(FeatureFlagRepository repo) { this.repo = repo; }

    public List<FeatureFlag> list(String tenantId) {
        return repo.findByTenantIdOrderByFlagKeyAsc(tenantId);
    }

    public FeatureFlag upsert(String tenantId, String key, boolean enabled, String description) {
        FeatureFlag flag = repo.findByTenantIdAndFlagKey(tenantId, key).orElseGet(() -> {
            FeatureFlag f = new FeatureFlag();
            f.setTenantId(tenantId);
            f.setFlagKey(key);
            return f;
        });
        flag.setEnabled(enabled);
        flag.setDescription(description);
        return repo.save(flag);
    }
}
