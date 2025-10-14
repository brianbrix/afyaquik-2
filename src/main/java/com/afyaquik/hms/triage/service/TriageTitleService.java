package com.afyaquik.hms.triage.service;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.triage.domain.TriageTitle;
import com.afyaquik.hms.triage.dto.TriageTitleDto;
import com.afyaquik.hms.triage.repository.TriageTitleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TriageTitleService {
    private final TriageTitleRepository repository;

    public TriageTitleService(TriageTitleRepository repository) {
        this.repository = repository;
    }

    public List<TriageTitleDto> getAll() {
        return repository.findAll().stream()
                .map(t -> new TriageTitleDto(t.getId(), t.getTitle()))
                .collect(Collectors.toList());
    }

    public TriageTitleDto create(String title) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        boolean exists = repository.existsByTitleAndTenantId(title, tenantId);
        if (exists) {
            throw new IllegalStateException("TriageTitle with the same title already exists");
        }
        TriageTitle entity = new TriageTitle();
        entity.setTitle(title);
        entity.setTenantId(tenantId);
        repository.save(entity);
        return new TriageTitleDto(entity.getId(), entity.getTitle());
    }

    @Transactional
    public TriageTitleDto update(Long id, String title) {
        TriageTitle entity = repository.findById(id).orElseThrow(()-> new IllegalStateException("TriageTitle not found"));
        entity.setTitle(title);
        return new TriageTitleDto(entity.getId(), entity.getTitle());
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
