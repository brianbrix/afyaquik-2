package com.afyaquik.hms.configuration.service;

import com.afyaquik.hms.configuration.domain.TenantTheme;
import com.afyaquik.hms.configuration.repository.TenantThemeRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class TenantThemeService {
    private static final Logger log = LoggerFactory.getLogger(TenantThemeService.class);
    private final TenantThemeRepository repo;

    public TenantThemeService(TenantThemeRepository repo) { this.repo = repo; }

    public Optional<TenantTheme> get(String tenantId) {
        log.debug("Get theme for tenant={}", tenantId);
        return repo.findFirstByTenantId(tenantId);
    }

    public TenantTheme update(String tenantId, String primaryColor, String logoUrl, String updatedBy) {
        log.info("Update theme for tenant={} by={}", tenantId, updatedBy);
        TenantTheme theme = repo.findFirstByTenantId(tenantId).orElseGet(() -> {
            TenantTheme t = new TenantTheme();
            t.setTenantId(tenantId);
            return t;
        });
        theme.setPrimaryColor(primaryColor);
        theme.setLogoUrl(logoUrl);
        theme.setUpdatedBy(updatedBy);
        TenantTheme saved = repo.save(theme);
        log.debug("Theme updated id={}", saved.getId());
        return saved;
    }
}
