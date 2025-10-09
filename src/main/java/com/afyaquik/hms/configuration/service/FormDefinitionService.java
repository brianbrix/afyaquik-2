package com.afyaquik.hms.configuration.service;

import com.afyaquik.hms.configuration.domain.FormDefinition;
import com.afyaquik.hms.configuration.repository.FormDefinitionRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class FormDefinitionService {
    private final FormDefinitionRepository repo;

    public FormDefinitionService(FormDefinitionRepository repo) { this.repo = repo; }

    public Optional<FormDefinition> getLatest(String tenantId, String formKey) {
        return repo.findTopByTenantIdAndFormKeyOrderByVersionDesc(tenantId, formKey);
    }

    public FormDefinition saveNewVersion(String tenantId, String formKey, String schemaJson) {
        int nextVersion = repo.findTopByTenantIdAndFormKeyOrderByVersionDesc(tenantId, formKey)
                .map(FormDefinition::getVersion)
                .map(v -> v + 1)
                .orElse(1);
        FormDefinition def = new FormDefinition();
        def.setTenantId(tenantId);
        def.setFormKey(formKey);
        def.setSchemaJson(schemaJson);
        def.setVersion(nextVersion);
        return repo.save(def);
    }
}
