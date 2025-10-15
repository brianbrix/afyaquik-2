package com.afyaquik.hms.billing.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.billing.domain.BillingItem;
import com.afyaquik.hms.billing.dto.BillingItemDto;
import com.afyaquik.hms.billing.dto.BillingItemRequest;
import com.afyaquik.hms.billing.repository.BillingItemRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

@Service
@Transactional
public class BillingItemService {

    @Autowired
    private BillingItemRepository billingItemRepository;

    /**
     * Get all billing items for the current tenant.
     */
    @Transactional(readOnly = true)
    public List<BillingItemDto> getAllBillingItems() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return billingItemRepository.findByTenantIdAndDeletedFalseOrderByServiceCategoryAscDescriptionAsc(tenantId)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * Get billing item by ID.
     */
    @Transactional(readOnly = true)
    public BillingItemDto getBillingItemById(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        BillingItem billingItem = billingItemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Billing item not found"));
        
        if (!billingItem.getTenantId().equals(tenantId) || billingItem.isDeleted()) {
            throw new RuntimeException("Billing item not found");
        }
        
        return convertToDto(billingItem);
    }

    /**
     * Create a new billing item.
     */
    public BillingItemDto createBillingItem(BillingItemRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        // Check if item code already exists
        if (billingItemRepository.findByTenantIdAndItemCodeAndDeletedFalse(tenantId, request.getItemCode()).isPresent()) {
            throw new RuntimeException("Item code already exists: " + request.getItemCode());
        }
        
        BillingItem billingItem = new BillingItem();
        billingItem.setTenantId(tenantId);
        billingItem.setItemCode(request.getItemCode());
        billingItem.setDescription(request.getDescription());
        billingItem.setUnitPrice(request.getUnitPrice());
        billingItem.setServiceCategory(request.getServiceCategory());
        billingItem.setIsActive(request.getIsActive());
        
        BillingItem savedItem = billingItemRepository.save(billingItem);
        return convertToDto(savedItem);
    }

    /**
     * Update an existing billing item.
     */
    public BillingItemDto updateBillingItem(Long id, BillingItemRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        BillingItem billingItem = billingItemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Billing item not found"));
        
        if (!billingItem.getTenantId().equals(tenantId) || billingItem.isDeleted()) {
            throw new RuntimeException("Billing item not found");
        }
        
        // Check if item code already exists (excluding current item)
        billingItemRepository.findByTenantIdAndItemCodeAndDeletedFalse(tenantId, request.getItemCode())
            .ifPresent(existingItem -> {
                if (!existingItem.getId().equals(id)) {
                    throw new RuntimeException("Item code already exists: " + request.getItemCode());
                }
            });
        
        billingItem.setItemCode(request.getItemCode());
        billingItem.setDescription(request.getDescription());
        billingItem.setUnitPrice(request.getUnitPrice());
        billingItem.setServiceCategory(request.getServiceCategory());
        billingItem.setIsActive(request.getIsActive());
        
        BillingItem savedItem = billingItemRepository.save(billingItem);
        return convertToDto(savedItem);
    }

    /**
     * Delete a billing item.
     */
    public void deleteBillingItem(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        BillingItem billingItem = billingItemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Billing item not found"));
        
        if (!billingItem.getTenantId().equals(tenantId) || billingItem.isDeleted()) {
            throw new RuntimeException("Billing item not found");
        }
        
        billingItem.softDelete();
        billingItemRepository.save(billingItem);
    }

    /**
     * Get billing items by service category.
     */
    @Transactional(readOnly = true)
    public List<BillingItemDto> getBillingItemsByCategory(String serviceCategory) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return billingItemRepository.findByTenantIdAndServiceCategoryAndIsActiveTrueAndDeletedFalseOrderByDescriptionAsc(tenantId, serviceCategory)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * Convert BillingItem entity to DTO.
     */
    private BillingItemDto convertToDto(BillingItem billingItem) {
        BillingItemDto dto = new BillingItemDto();
        dto.setId(billingItem.getId());
        dto.setItemCode(billingItem.getItemCode());
        dto.setDescription(billingItem.getDescription());
        dto.setUnitPrice(billingItem.getUnitPrice());
        dto.setServiceCategory(billingItem.getServiceCategory());
        dto.setIsActive(billingItem.getIsActive());
        dto.setCreatedAt(billingItem.getCreatedAt());
        dto.setUpdatedAt(billingItem.getUpdatedAt());
        return dto;
    }
}
