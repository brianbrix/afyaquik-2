package com.afyaquik.hms.configuration.repository;

import com.afyaquik.hms.configuration.domain.FormDefinition;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormDefinitionRepository extends JpaRepository<FormDefinition, Long> {
    Optional<FormDefinition> findTopByTenantIdAndFormKeyOrderByVersionDesc(String tenantId, String formKey);
    List<FormDefinition> findByTenantIdAndFormKey(String tenantId, String formKey);
}
