package com.afyaquik.hms.inventory.service;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.inventory.domain.ItemCategory;
import com.afyaquik.hms.inventory.dto.ItemCategoryDto;
import com.afyaquik.hms.inventory.dto.ItemCategoryRequest;
import com.afyaquik.hms.inventory.repository.ItemCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ItemCategoryService {
    
    @Autowired
    private ItemCategoryRepository itemCategoryRepository;
    
    public List<ItemCategoryDto> getAllCategories() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        List<ItemCategory> categories = itemCategoryRepository.findByTenantIdAndDeletedFalse(tenantId);
        return categories.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public ItemCategoryDto getCategoryById(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        ItemCategory category = itemCategoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
        
        if (!category.getTenantId().equals(tenantId) || category.isDeleted()) {
            throw new RuntimeException("Category not found");
        }
        
        return convertToDto(category);
    }
    
    public ItemCategoryDto createCategory(ItemCategoryRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        // Check if category name already exists
        if (itemCategoryRepository.findByTenantIdAndCategoryNameAndDeletedFalse(tenantId, request.getCategoryName()).isPresent()) {
            throw new RuntimeException("Category name already exists");
        }
        
        ItemCategory category = new ItemCategory();
        category.setTenantId(tenantId);
        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());
        category.setIsActive(request.getIsActive());
        
        ItemCategory savedCategory = itemCategoryRepository.save(category);
        return convertToDto(savedCategory);
    }
    
    public ItemCategoryDto updateCategory(Long id, ItemCategoryRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        ItemCategory category = itemCategoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
        
        if (!category.getTenantId().equals(tenantId) || category.isDeleted()) {
            throw new RuntimeException("Category not found");
        }
        
        // Check if category name already exists (excluding current category)
        itemCategoryRepository.findByTenantIdAndCategoryNameAndDeletedFalse(tenantId, request.getCategoryName())
            .ifPresent(existingCategory -> {
                if (!existingCategory.getId().equals(id)) {
                    throw new RuntimeException("Category name already exists");
                }
            });
        
        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());
        category.setIsActive(request.getIsActive());
        
        ItemCategory savedCategory = itemCategoryRepository.save(category);
        return convertToDto(savedCategory);
    }
    
    public void deleteCategory(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        ItemCategory category = itemCategoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
        
        if (!category.getTenantId().equals(tenantId) || category.isDeleted()) {
            throw new RuntimeException("Category not found");
        }
        
        category.softDelete();
        itemCategoryRepository.save(category);
    }
    
    private ItemCategoryDto convertToDto(ItemCategory category) {
        ItemCategoryDto dto = new ItemCategoryDto();
        dto.setId(category.getId());
        dto.setCategoryName(category.getCategoryName());
        dto.setDescription(category.getDescription());
        dto.setIsActive(category.getIsActive());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        return dto;
    }
}

