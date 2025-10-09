package com.afyaquik.hms.configuration.service;

import com.afyaquik.hms.configuration.domain.TenantTheme;
import com.afyaquik.hms.configuration.repository.TenantThemeRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TenantThemeService {
    private final TenantThemeRepository repo;

    public TenantThemeService(TenantThemeRepository repo) { this.repo = repo; }

    public Optional<TenantTheme> get(String tenantId) {
        return repo.findFirstByTenantId(tenantId);
    }

    public TenantTheme update(String tenantId, String primaryColor, String logoUrl, String updatedBy) {
        TenantTheme theme = repo.findFirstByTenantId(tenantId).orElseGet(() -> {
            TenantTheme t = new TenantTheme();
            t.setTenantId(tenantId);
            return t;
        });
        theme.setPrimaryColor(primaryColor);
        theme.setLogoUrl(logoUrl);
        theme.setUpdatedBy(updatedBy);
        return repo.save(theme);
    }
}
