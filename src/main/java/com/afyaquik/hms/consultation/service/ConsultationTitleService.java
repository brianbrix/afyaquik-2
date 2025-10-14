package com.afyaquik.hms.consultation.service;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.consultation.domain.ConsultationTitle;
import com.afyaquik.hms.consultation.dto.ConsultationTitleDto;
import com.afyaquik.hms.consultation.repository.ConsultationTitleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConsultationTitleService {
    private final ConsultationTitleRepository repository;

    public ConsultationTitleService(ConsultationTitleRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ConsultationTitleDto> getAll() {
        return repository.findAll().stream()
                .map(t -> new ConsultationTitleDto(t.getId(), t.getTitle()))
                .collect(Collectors.toList());
    }

    @Transactional
    public ConsultationTitleDto create(String title) {
        if (repository.existsByTitle(title)) {
            throw new IllegalStateException("ConsultationTitle with the same title already exists");
        }
        ConsultationTitle entity = new ConsultationTitle();
        entity.setTitle(title);
        entity.setTenantId(TenantHeaderInterceptor.getCurrentTenant());
        repository.save(entity);
        return new ConsultationTitleDto(entity.getId(), entity.getTitle());
    }

    @Transactional
    public ConsultationTitleDto update(Long id, String title) {
        ConsultationTitle entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ConsultationTitle not found"));
        entity.setTitle(title);
        repository.save(entity);
        return new ConsultationTitleDto(entity.getId(), entity.getTitle());
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
