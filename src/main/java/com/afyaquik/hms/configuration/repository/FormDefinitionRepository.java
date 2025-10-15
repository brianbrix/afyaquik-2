package com.afyaquik.hms.configuration.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import com.afyaquik.hms.configuration.domain.FormDefinition;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormDefinitionRepository extends TenantAwareRepository<FormDefinition, Long> {
    Optional<FormDefinition> findTopByTenantIdAndFormKeyOrderByCreatedAtDesc(String tenantId, String formKey);
    List<FormDefinition> findByTenantIdAndFormKey(String tenantId, String formKey);
}
