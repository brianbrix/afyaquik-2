package com.afyaquik.hms.notification.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import com.afyaquik.hms.notification.domain.NotificationTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationTemplateRepository extends TenantAwareRepository<NotificationTemplate, Long> {
    Optional<NotificationTemplate> findByTenantIdAndCode(String tenantId, String code);
    
    // Tenant-aware default method
    default Optional<NotificationTemplate> findByCode(String code) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndCode(tenantId, code);
    }
}