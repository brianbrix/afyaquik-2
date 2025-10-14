package com.afyaquik.hms.diagnostics.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.diagnostics.domain.ResultTemplate;
import com.afyaquik.hms.diagnostics.domain.TestCatalog;
import com.afyaquik.hms.diagnostics.dto.ResultTemplateDto;
import com.afyaquik.hms.diagnostics.repository.ResultTemplateRepository;
import com.afyaquik.hms.diagnostics.repository.TestCatalogRepository;

@Service
@Transactional
public class ResultTemplateService {
    
    private final ResultTemplateRepository resultTemplateRepository;
    private final TestCatalogRepository testCatalogRepository;
    
    public ResultTemplateService(ResultTemplateRepository resultTemplateRepository,
                                TestCatalogRepository testCatalogRepository) {
        this.resultTemplateRepository = resultTemplateRepository;
        this.testCatalogRepository = testCatalogRepository;
    }
    
    public List<ResultTemplateDto> getAllResultTemplates() {
        List<ResultTemplate> templates = resultTemplateRepository.findAll();
        return templates.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<ResultTemplateDto> getActiveResultTemplates() {
        List<ResultTemplate> templates = resultTemplateRepository.findByActiveTrueOrderBySortOrderAsc();
        return templates.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<ResultTemplateDto> getResultTemplatesByTestCatalog(Long testCatalogId) {
        List<ResultTemplate> templates = resultTemplateRepository.findByTestCatalogIdOrderBySortOrderAsc(testCatalogId);
        return templates.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public Optional<ResultTemplateDto> getResultTemplateById(Long id) {
        return resultTemplateRepository.findById(id).map(this::convertToDto);
    }
    
    public ResultTemplateDto createResultTemplate(ResultTemplateDto dto) {
        ResultTemplate template = convertToEntity(dto);
        template.setId(null); // Ensure it's a new entity
        template.setTenantId(TenantHeaderInterceptor.getCurrentTenant());
        ResultTemplate saved = resultTemplateRepository.save(template);
        return convertToDto(saved);
    }
    
    public Optional<ResultTemplateDto> updateResultTemplate(Long id, ResultTemplateDto dto) {
        return resultTemplateRepository.findById(id).map(existing -> {
            ResultTemplate updated = convertToEntity(dto);
            updated.setId(id);
            updated.setTenantId(existing.getTenantId()); // Preserve existing tenant ID
            ResultTemplate saved = resultTemplateRepository.save(updated);
            return convertToDto(saved);
        });
    }
    
    public boolean deleteResultTemplate(Long id) {
        if (!resultTemplateRepository.existsById(id)) {
            return false;
        }
        resultTemplateRepository.deleteById(id);
        return true;
    }
    
    private ResultTemplateDto convertToDto(ResultTemplate template) {
        ResultTemplateDto dto = new ResultTemplateDto();
        dto.setId(template.getId());
        dto.setTestCatalogId(template.getTestCatalog().getId());
        dto.setTestName(template.getTestCatalog().getTestName());
        dto.setFieldName(template.getFieldName());
        dto.setFieldLabel(template.getFieldLabel());
        dto.setFieldType(template.getFieldType());
        dto.setFieldOptions(template.getFieldOptions());
        dto.setRequired(template.isRequired());
        dto.setSortOrder(template.getSortOrder());
        dto.setValidationRules(template.getValidationRules());
        dto.setNormalRange(template.getNormalRange());
        dto.setUnits(template.getUnits());
        dto.setActive(template.isActive());
        return dto;
    }
    
    private ResultTemplate convertToEntity(ResultTemplateDto dto) {
        ResultTemplate template = new ResultTemplate();
        template.setId(dto.getId());
        template.setFieldName(dto.getFieldName());
        template.setFieldLabel(dto.getFieldLabel());
        template.setFieldType(dto.getFieldType());
        template.setFieldOptions(dto.getFieldOptions());
        template.setRequired(dto.isRequired());
        template.setSortOrder(dto.getSortOrder());
        template.setValidationRules(dto.getValidationRules());
        template.setNormalRange(dto.getNormalRange());
        template.setUnits(dto.getUnits());
        template.setActive(dto.isActive());
        
        // Set test catalog
        if (dto.getTestCatalogId() != null) {
            TestCatalog testCatalog = testCatalogRepository.findById(dto.getTestCatalogId())
                .orElseThrow(() -> new RuntimeException("Test catalog not found: " + dto.getTestCatalogId()));
            template.setTestCatalog(testCatalog);
        }
        
        return template;
    }
}
