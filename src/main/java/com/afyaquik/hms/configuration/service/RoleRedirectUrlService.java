package com.afyaquik.hms.configuration.service;

import com.afyaquik.hms.configuration.domain.RoleRedirectUrl;
import com.afyaquik.hms.configuration.repository.RoleRedirectUrlRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RoleRedirectUrlService {
    private final RoleRedirectUrlRepository repository;

    public RoleRedirectUrlService(RoleRedirectUrlRepository repository) {
        this.repository = repository;
    }

    public Optional<RoleRedirectUrl> getByTenantAndRole(String tenantId, String roleKey) {
        return repository.findByTenantIdAndRoleKey(tenantId, roleKey);
    }

    public List<RoleRedirectUrl> getAllForTenant(String tenantId) {
        return repository.findByTenantId(tenantId);
    }

    @Transactional
    public RoleRedirectUrl saveOrUpdate(String tenantId, String roleKey, String redirectUrl) {
        Optional<RoleRedirectUrl> existing = repository.findByTenantIdAndRoleKey(tenantId, roleKey);
        if (existing.isPresent()) {
            RoleRedirectUrl entity = existing.get();
            entity.setRedirectUrl(redirectUrl);
            return repository.save(entity);
        } else {
            RoleRedirectUrl entity = new RoleRedirectUrl(tenantId, roleKey, redirectUrl);
            return repository.save(entity);
        }
    }

    @Transactional
    public void delete(String tenantId, String roleKey) {
        repository.findByTenantIdAndRoleKey(tenantId, roleKey).ifPresent(repository::delete);
    }
}
