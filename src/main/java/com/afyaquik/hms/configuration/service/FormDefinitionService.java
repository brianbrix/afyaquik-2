package com.afyaquik.hms.configuration.service;

import com.afyaquik.hms.configuration.domain.FormDefinition;
import com.afyaquik.hms.configuration.repository.FormDefinitionRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class FormDefinitionService {
    private static final Logger log = LoggerFactory.getLogger(FormDefinitionService.class);
    private final FormDefinitionRepository repo;

    public FormDefinitionService(FormDefinitionRepository repo) { this.repo = repo; }

    public Optional<FormDefinition> getLatest(String tenantId, String formKey) {
        log.debug("Get latest form definition tenant={} formKey={}", tenantId, formKey);
        return repo.findTopByTenantIdAndFormKeyOrderByVersionDesc(tenantId, formKey);
    }

    public FormDefinition saveNewVersion(String tenantId, String formKey, String schemaJson) {
        log.info("Save new form version tenant={} formKey={}", tenantId, formKey);
        int nextVersion = repo.findTopByTenantIdAndFormKeyOrderByVersionDesc(tenantId, formKey)
                .map(FormDefinition::getVersion)
                .map(v -> v + 1)
                .orElse(1);
        FormDefinition def = new FormDefinition();
        def.setTenantId(tenantId);
        def.setFormKey(formKey);
        def.setSchemaJson(schemaJson);
        def.setVersion(nextVersion);
        FormDefinition saved = repo.save(def);
        log.debug("Form definition saved id={} version={}", saved.getId(), saved.getVersion());
        return saved;
    }
}
