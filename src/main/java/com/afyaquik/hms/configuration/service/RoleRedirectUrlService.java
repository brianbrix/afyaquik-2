package com.afyaquik.hms.configuration.service;

import com.afyaquik.hms.configuration.domain.RoleRedirectUrl;
import com.afyaquik.hms.configuration.repository.RoleRedirectUrlRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class RoleRedirectUrlService {
    private static final Logger log = LoggerFactory.getLogger(RoleRedirectUrlService.class);
    private final RoleRedirectUrlRepository repository;

    public RoleRedirectUrlService(RoleRedirectUrlRepository repository) {
        this.repository = repository;
    }

    public Optional<RoleRedirectUrl> getByTenantAndRole(String tenantId, String roleKey) {
        log.debug("Get redirect url by tenant and role tenant={} roleKey={}", tenantId, roleKey);
        return repository.findByTenantIdAndRoleKey(tenantId, roleKey);
    }

    public List<RoleRedirectUrl> getAllForTenant(String tenantId) {
        log.debug("Get all redirect urls for tenant={}", tenantId);
        return repository.findByTenantId(tenantId);
    }

    @Transactional
    public RoleRedirectUrl saveOrUpdate(String tenantId, String roleKey, String redirectUrl) {
        log.info("Save or update redirect url tenant={} roleKey={} url={}", tenantId, roleKey, redirectUrl);
        Optional<RoleRedirectUrl> existing = repository.findByTenantIdAndRoleKey(tenantId, roleKey);
        if (existing.isPresent()) {
            RoleRedirectUrl entity = existing.get();
            entity.setRedirectUrl(redirectUrl);
            RoleRedirectUrl saved = repository.save(entity);
            log.debug("Updated redirect url id={}", saved.getId());
            return saved;
        } else {
            RoleRedirectUrl entity = new RoleRedirectUrl(tenantId, roleKey, redirectUrl);
            RoleRedirectUrl saved = repository.save(entity);
            log.debug("Created redirect url id={}", saved.getId());
            return saved;
        }
    }

    @Transactional
    public void delete(String tenantId, String roleKey) {
        log.info("Delete redirect url tenant={} roleKey={}", tenantId, roleKey);
        repository.findByTenantIdAndRoleKey(tenantId, roleKey).ifPresent(entity -> {
            repository.delete(entity);
            log.debug("Deleted redirect url id={}", entity.getId());
        });
    }
}
