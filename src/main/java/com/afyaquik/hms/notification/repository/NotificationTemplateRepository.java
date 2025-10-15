package com.afyaquik.hms.notification.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import com.afyaquik.hms.notification.domain.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationTemplateRepository extends TenantAwareRepository<NotificationTemplate, Long> {
    Optional<NotificationTemplate> findByCode(String code);
}