package com.afyaquik.hms.triage.service;

import com.afyaquik.hms.triage.domain.TriageItem;
import com.afyaquik.hms.triage.dto.TriageItemDto;
import com.afyaquik.hms.triage.dto.TriageItemRequest;
import com.afyaquik.hms.triage.repository.TriageItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TriageItemService {

    private final TriageItemRepository triageItemRepository;

    /**
     * Create a new triage item
     */
    public TriageItemDto createTriageItem(TriageItemRequest request, String tenantId) {
        TriageItem triageItem = new TriageItem();
        triageItem.setTenantId(tenantId);
        triageItem.setName(request.getName());
        triageItem.setDescription(request.getDescription());
        triageItem.setCategory(request.getCategory());
        triageItem.setDataType(request.getDataType());
        triageItem.setUnit(request.getUnit());
        triageItem.setInputConfig(request.getInputConfig());
        triageItem.setNormalRangeMin(request.getNormalRangeMin());
        triageItem.setNormalRangeMax(request.getNormalRangeMax());
        triageItem.setWarningThresholdMin(request.getWarningThresholdMin());
        triageItem.setWarningThresholdMax(request.getWarningThresholdMax());
        triageItem.setCriticalThresholdMin(request.getCriticalThresholdMin());
        triageItem.setCriticalThresholdMax(request.getCriticalThresholdMax());
        triageItem.setCalculationFormula(request.getCalculationFormula());
        triageItem.setDisplayOrder(request.getDisplayOrder());
        triageItem.setActive(request.getActive() != null ? request.getActive() : true);

        TriageItem saved = triageItemRepository.save(triageItem);
        return convertToDto(saved);
    }

    /**
     * Update an existing triage item
     */
    public TriageItemDto updateTriageItem(Long id, TriageItemRequest request, String tenantId) {
        TriageItem triageItem = triageItemRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Triage item not found"));

        triageItem.setName(request.getName());
        triageItem.setDescription(request.getDescription());
        triageItem.setCategory(request.getCategory());
        triageItem.setDataType(request.getDataType());
        triageItem.setUnit(request.getUnit());
        triageItem.setInputConfig(request.getInputConfig());
        triageItem.setNormalRangeMin(request.getNormalRangeMin());
        triageItem.setNormalRangeMax(request.getNormalRangeMax());
        triageItem.setWarningThresholdMin(request.getWarningThresholdMin());
        triageItem.setWarningThresholdMax(request.getWarningThresholdMax());
        triageItem.setCriticalThresholdMin(request.getCriticalThresholdMin());
        triageItem.setCriticalThresholdMax(request.getCriticalThresholdMax());
        triageItem.setCalculationFormula(request.getCalculationFormula());
        triageItem.setDisplayOrder(request.getDisplayOrder());
        triageItem.setActive(request.getActive());

        TriageItem saved = triageItemRepository.save(triageItem);
        return convertToDto(saved);
    }

    /**
     * Get all active triage items for a tenant
     */
    @Transactional(readOnly = true)
    public List<TriageItemDto> getActiveTriageItems(String tenantId) {
        List<TriageItem> items = triageItemRepository.findByTenantIdAndActiveTrueAndDeletedFalseOrderByDisplayOrderAsc(tenantId);
        return items.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Get triage items by category
     */
    @Transactional(readOnly = true)
    public List<TriageItemDto> getTriageItemsByCategory(String category, String tenantId) {
        List<TriageItem> items = triageItemRepository.findByTenantIdAndCategoryAndActiveTrueAndDeletedFalseOrderByDisplayOrderAsc(tenantId, category);
        return items.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Get triage items by data type
     */
    @Transactional(readOnly = true)
    public List<TriageItemDto> getTriageItemsByDataType(TriageItem.TriageDataType dataType, String tenantId) {
        List<TriageItem> items = triageItemRepository.findByTenantIdAndDataTypeAndActiveTrueAndDeletedFalseOrderByDisplayOrderAsc(tenantId, dataType);
        return items.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Get distinct categories
     */
    @Transactional(readOnly = true)
    public List<String> getDistinctCategories(String tenantId) {
        return triageItemRepository.findDistinctCategoriesByTenantId(tenantId);
    }

    /**
     * Get distinct data types
     */
    @Transactional(readOnly = true)
    public List<TriageItem.TriageDataType> getDistinctDataTypes(String tenantId) {
        return triageItemRepository.findDistinctDataTypesByTenantId(tenantId);
    }

    /**
     * Delete a triage item
     */
    public void deleteTriageItem(Long id, String tenantId) {
        TriageItem triageItem = triageItemRepository.findByIdAndTenantId(id, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Triage item not found"));
        
        triageItem.softDelete();
        triageItemRepository.save(triageItem);
    }

    /**
     * Convert entity to DTO
     */
    private TriageItemDto convertToDto(TriageItem item) {
        TriageItemDto dto = new TriageItemDto();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setCategory(item.getCategory());
        dto.setDataType(item.getDataType());
        dto.setUnit(item.getUnit());
        dto.setInputConfig(item.getInputConfig());
        dto.setNormalRangeMin(item.getNormalRangeMin());
        dto.setNormalRangeMax(item.getNormalRangeMax());
        dto.setWarningThresholdMin(item.getWarningThresholdMin());
        dto.setWarningThresholdMax(item.getWarningThresholdMax());
        dto.setCriticalThresholdMin(item.getCriticalThresholdMin());
        dto.setCriticalThresholdMax(item.getCriticalThresholdMax());
        dto.setCalculationFormula(item.getCalculationFormula());
        dto.setVariableMappings(item.getVariableMappings());
        dto.setDisplayOrder(item.getDisplayOrder());
        dto.setActive(item.getActive());
        dto.setCreatedAt(item.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        dto.setUpdatedAt(item.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        return dto;
    }
}