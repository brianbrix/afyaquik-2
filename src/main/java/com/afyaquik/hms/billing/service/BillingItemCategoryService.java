package com.afyaquik.hms.billing.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.billing.domain.BillingItemCategory;
import com.afyaquik.hms.billing.dto.BillingItemCategoryDto;
import com.afyaquik.hms.billing.dto.BillingItemCategoryRequest;
import com.afyaquik.hms.billing.repository.BillingItemCategoryRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

@Service
@Transactional
public class BillingItemCategoryService {

    @Autowired
    private BillingItemCategoryRepository billingItemCategoryRepository;

    /**
     * Get all billing item categories for the current tenant.
     */
    @Transactional(readOnly = true)
    public List<BillingItemCategoryDto> getAllCategories() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return billingItemCategoryRepository.findByTenantIdAndDeletedFalseOrderByCategoryNameAsc(tenantId)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * Get active billing item categories for the current tenant.
     */
    @Transactional(readOnly = true)
    public List<BillingItemCategoryDto> getActiveCategories() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return billingItemCategoryRepository.findByTenantIdAndIsActiveTrueAndDeletedFalseOrderByCategoryNameAsc(tenantId)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * Get billing item category by ID.
     */
    @Transactional(readOnly = true)
    public BillingItemCategoryDto getCategoryById(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        BillingItemCategory category = billingItemCategoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Billing item category not found"));
        
        if (!category.getTenantId().equals(tenantId) || category.isDeleted()) {
            throw new RuntimeException("Billing item category not found");
        }
        
        return convertToDto(category);
    }

    /**
     * Create a new billing item category.
     */
    public BillingItemCategoryDto createCategory(BillingItemCategoryRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        // Check if category name already exists
        if (billingItemCategoryRepository.findByTenantIdAndCategoryNameAndDeletedFalse(tenantId, request.getCategoryName()).isPresent()) {
            throw new RuntimeException("Category name already exists: " + request.getCategoryName());
        }
        
        BillingItemCategory category = new BillingItemCategory();
        category.setTenantId(tenantId);
        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());
        category.setIsActive(request.getIsActive());
        
        BillingItemCategory savedCategory = billingItemCategoryRepository.save(category);
        return convertToDto(savedCategory);
    }

    /**
     * Update an existing billing item category.
     */
    public BillingItemCategoryDto updateCategory(Long id, BillingItemCategoryRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        BillingItemCategory category = billingItemCategoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Billing item category not found"));
        
        if (!category.getTenantId().equals(tenantId) || category.isDeleted()) {
            throw new RuntimeException("Billing item category not found");
        }
        
        // Check if category name already exists (excluding current category)
        billingItemCategoryRepository.findByTenantIdAndCategoryNameAndDeletedFalse(tenantId, request.getCategoryName())
            .ifPresent(existingCategory -> {
                if (!existingCategory.getId().equals(id)) {
                    throw new RuntimeException("Category name already exists: " + request.getCategoryName());
                }
            });
        
        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());
        category.setIsActive(request.getIsActive());
        
        BillingItemCategory savedCategory = billingItemCategoryRepository.save(category);
        return convertToDto(savedCategory);
    }

    /**
     * Delete a billing item category.
     */
    public void deleteCategory(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        BillingItemCategory category = billingItemCategoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Billing item category not found"));
        
        if (!category.getTenantId().equals(tenantId) || category.isDeleted()) {
            throw new RuntimeException("Billing item category not found");
        }
        
        category.softDelete();
        billingItemCategoryRepository.save(category);
    }

    /**
     * Convert BillingItemCategory entity to DTO.
     */
    private BillingItemCategoryDto convertToDto(BillingItemCategory category) {
        BillingItemCategoryDto dto = new BillingItemCategoryDto();
        dto.setId(category.getId());
        dto.setCategoryName(category.getCategoryName());
        dto.setDescription(category.getDescription());
        dto.setIsActive(category.getIsActive());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        return dto;
    }
}
