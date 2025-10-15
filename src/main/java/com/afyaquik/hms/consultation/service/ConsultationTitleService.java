package com.afyaquik.hms.consultation.service;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.consultation.domain.ConsultationTitle;
import com.afyaquik.hms.consultation.dto.ConsultationTitleDto;
import com.afyaquik.hms.consultation.dto.ConsultationTitleRequest;
import com.afyaquik.hms.consultation.repository.ConsultationTitleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ConsultationTitleService {
    private final ConsultationTitleRepository repository;

    public ConsultationTitleService(ConsultationTitleRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ConsultationTitleDto> getAll() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return repository.findAllHierarchical(tenantId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConsultationTitleDto> getRootTitles() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return repository.findRootTitles(tenantId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConsultationTitleDto> getChildren(Long parentId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return repository.findByParentId(tenantId, parentId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConsultationTitleDto> getByLevel(Integer level) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return repository.findByLevel(tenantId, level).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConsultationTitleDto> getParentCandidates() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return repository.findParentCandidates(tenantId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConsultationTitleDto getById(Long id) {
        ConsultationTitle entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ConsultationTitle not found"));
        return convertToDto(entity);
    }

    @Transactional
    public ConsultationTitleDto create(ConsultationTitleRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        // Validate parent if specified
        ConsultationTitle parent = null;
        if (request.getParentId() != null) {
            parent = repository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent consultation title not found"));
            
            // Validate level is parent level + 1
            if (request.getLevel() != parent.getLevel() + 1) {
                throw new IllegalArgumentException("Level must be parent level + 1");
            }
        } else {
            // Root level must be level 1
            if (request.getLevel() != 1) {
                throw new IllegalArgumentException("Root level titles must be level 1");
            }
        }

        // Check for duplicate title under same parent
        if (repository.existsByTitleAndParent(tenantId, request.getTitle(), 
                request.getParentId() != null ? request.getParentId() : null)) {
            throw new IllegalStateException("ConsultationTitle with the same title already exists under this parent");
        }

        ConsultationTitle entity = new ConsultationTitle();
        entity.setTitle(request.getTitle());
        entity.setLevel(request.getLevel());
        entity.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        entity.setIsCustom(request.getIsCustom() != null ? request.getIsCustom() : false);
        entity.setParent(parent);
        entity.setTenantId(tenantId);
        
        ConsultationTitle saved = repository.save(entity);
        return convertToDto(saved);
    }

    @Transactional
    public ConsultationTitleDto update(Long id, ConsultationTitleRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        ConsultationTitle entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ConsultationTitle not found"));

        if (!entity.getTenantId().equals(tenantId)) {
            throw new IllegalArgumentException("Access denied to consultation title in another tenant");
        }

        // Validate parent if specified
        ConsultationTitle parent = null;
        if (request.getParentId() != null) {
            parent = repository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent consultation title not found"));
            
            // Validate level is parent level + 1
            if (request.getLevel() != parent.getLevel() + 1) {
                throw new IllegalArgumentException("Level must be parent level + 1");
            }
        }

        // Check for duplicate title under same parent (excluding current entity)
        if (repository.existsByTitleAndParent(tenantId, request.getTitle(), 
                request.getParentId() != null ? request.getParentId() : null)) {
            // Check if it's the same entity
            if (!repository.findByTitleAndParent(tenantId, request.getTitle(), 
                    request.getParentId() != null ? request.getParentId() : null)
                    .map(ConsultationTitle::getId).orElse(-1L).equals(id)) {
                throw new IllegalStateException("ConsultationTitle with the same title already exists under this parent");
            }
        }

        entity.setTitle(request.getTitle());
        entity.setLevel(request.getLevel());
        entity.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : entity.getSortOrder());
        entity.setIsCustom(request.getIsCustom() != null ? request.getIsCustom() : entity.getIsCustom());
        entity.setParent(parent);
        
        ConsultationTitle saved = repository.save(entity);
        return convertToDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        ConsultationTitle entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ConsultationTitle not found"));

        if (!entity.getTenantId().equals(tenantId)) {
            throw new IllegalArgumentException("Access denied to consultation title in another tenant");
        }

        // Check if it has children
        if (!repository.findByParentId(tenantId, id).isEmpty()) {
            throw new IllegalStateException("Cannot delete consultation title with children");
        }

        entity.softDelete();
        repository.save(entity);
    }

    /**
     * Convert entity to DTO.
     */
    private ConsultationTitleDto convertToDto(ConsultationTitle entity) {
        ConsultationTitleDto dto = new ConsultationTitleDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setLevel(entity.getLevel());
        dto.setSortOrder(entity.getSortOrder());
        dto.setIsCustom(entity.getIsCustom());
        dto.setParentId(entity.getParent() != null ? entity.getParent().getId() : null);
        dto.setParentTitle(entity.getParent() != null ? entity.getParent().getTitle() : null);
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
