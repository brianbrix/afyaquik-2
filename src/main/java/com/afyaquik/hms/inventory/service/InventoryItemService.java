package com.afyaquik.hms.inventory.service;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.inventory.domain.InventoryItem;
import com.afyaquik.hms.inventory.domain.ItemCategory;
import com.afyaquik.hms.inventory.domain.Supplier;
import com.afyaquik.hms.inventory.dto.InventoryItemDto;
import com.afyaquik.hms.inventory.dto.InventoryItemRequest;
import com.afyaquik.hms.inventory.repository.InventoryItemRepository;
import com.afyaquik.hms.inventory.repository.ItemCategoryRepository;
import com.afyaquik.hms.inventory.repository.SupplierRepository;
import com.afyaquik.hms.auth.domain.Department;
import com.afyaquik.hms.auth.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InventoryItemService {
    
    private final InventoryItemRepository inventoryItemRepository;
    
    private final ItemCategoryRepository itemCategoryRepository;
    
    private final SupplierRepository supplierRepository;
    
    private final DepartmentRepository departmentRepository;

    public InventoryItemService(InventoryItemRepository inventoryItemRepository, ItemCategoryRepository itemCategoryRepository, SupplierRepository supplierRepository, DepartmentRepository departmentRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.itemCategoryRepository = itemCategoryRepository;
        this.supplierRepository = supplierRepository;
        this.departmentRepository = departmentRepository;
    }
    
    public List<InventoryItemDto> getAllInventoryItems() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        List<InventoryItem> items = inventoryItemRepository.findByTenantIdAndDeletedFalse(tenantId);
        return items.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public InventoryItemDto getInventoryItemById(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        InventoryItem item = inventoryItemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        
        if (!item.getTenantId().equals(tenantId) || item.isDeleted()) {
            throw new RuntimeException("Inventory item not found");
        }
        
        return convertToDto(item);
    }
    
    public InventoryItemDto createInventoryItem(InventoryItemRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        // Validate category exists
        ItemCategory category = itemCategoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new RuntimeException("Category not found"));
        
        if (!category.getTenantId().equals(tenantId) || category.isDeleted()) {
            throw new RuntimeException("Category not found");
        }
        
        // Validate supplier exists
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
            .orElseThrow(() -> new RuntimeException("Supplier not found"));
        
        if (!supplier.getTenantId().equals(tenantId) || supplier.isDeleted()) {
            throw new RuntimeException("Supplier not found");
        }
        
        // Validate department exists
        Department department = departmentRepository.findByTenantIdAndDepartmentId(tenantId, request.getDepartmentId())
            .orElseThrow(() -> new RuntimeException("Department not found"));
        
        // Check if item code already exists
        if (inventoryItemRepository.findByTenantIdAndItemCodeAndDeletedFalse(tenantId, request.getItemCode()).isPresent()) {
            throw new RuntimeException("Item code already exists");
        }
        
        // Create inventory item
        InventoryItem item = new InventoryItem();
        item.setTenantId(tenantId);
        item.setItemCode(request.getItemCode());
        item.setItemName(request.getItemName());
        item.setDescription(request.getDescription());
        item.setCategory(category);
        item.setSupplier(supplier);
        item.setDepartment(department);
        item.setUnitOfMeasure(request.getUnitOfMeasure());
        item.setCurrentStock(request.getCurrentStock());
        item.setMinimumStockLevel(request.getMinimumStockLevel());
        item.setMaximumStockLevel(request.getMaximumStockLevel());
        item.setUnitCost(request.getUnitCost());
        item.setUnitPrice(request.getUnitPrice());
        item.setBarcode(request.getBarcode());
        item.setIsActive(request.getIsActive());
        item.setIsControlledSubstance(request.getIsControlledSubstance());
        item.setRequiresPrescription(request.getRequiresPrescription());
        item.setStorageLocation(request.getStorageLocation());
        item.setExpiryDate(request.getExpiryDate());
        item.setBatchNumber(request.getBatchNumber());
        item.setNotes(request.getNotes());
        
        InventoryItem savedItem = inventoryItemRepository.save(item);
        return convertToDto(savedItem);
    }
    
    public InventoryItemDto updateInventoryItem(Long id, InventoryItemRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        InventoryItem item = inventoryItemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        
        if (!item.getTenantId().equals(tenantId) || item.isDeleted()) {
            throw new RuntimeException("Inventory item not found");
        }
        
        // Validate category exists
        ItemCategory category = itemCategoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new RuntimeException("Category not found"));
        
        if (!category.getTenantId().equals(tenantId) || category.isDeleted()) {
            throw new RuntimeException("Category not found");
        }
        
        // Validate supplier exists
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
            .orElseThrow(() -> new RuntimeException("Supplier not found"));
        
        if (!supplier.getTenantId().equals(tenantId) || supplier.isDeleted()) {
            throw new RuntimeException("Supplier not found");
        }
        
        // Validate department exists
        Department department = departmentRepository.findByTenantIdAndDepartmentId(tenantId, request.getDepartmentId())
            .orElseThrow(() -> new RuntimeException("Department not found"));
        
        // Check if item code already exists (excluding current item)
        inventoryItemRepository.findByTenantIdAndItemCodeAndDeletedFalse(tenantId, request.getItemCode())
            .ifPresent(existingItem -> {
                if (!existingItem.getId().equals(id)) {
                    throw new RuntimeException("Item code already exists");
                }
            });
        
        // Update inventory item
        item.setItemCode(request.getItemCode());
        item.setItemName(request.getItemName());
        item.setDescription(request.getDescription());
        item.setCategory(category);
        item.setSupplier(supplier);
        item.setDepartment(department);
        item.setUnitOfMeasure(request.getUnitOfMeasure());
        item.setCurrentStock(request.getCurrentStock());
        item.setMinimumStockLevel(request.getMinimumStockLevel());
        item.setMaximumStockLevel(request.getMaximumStockLevel());
        item.setUnitCost(request.getUnitCost());
        item.setUnitPrice(request.getUnitPrice());
        item.setBarcode(request.getBarcode());
        item.setIsActive(request.getIsActive());
        item.setIsControlledSubstance(request.getIsControlledSubstance());
        item.setRequiresPrescription(request.getRequiresPrescription());
        item.setStorageLocation(request.getStorageLocation());
        item.setExpiryDate(request.getExpiryDate());
        item.setBatchNumber(request.getBatchNumber());
        item.setNotes(request.getNotes());
        
        InventoryItem savedItem = inventoryItemRepository.save(item);
        return convertToDto(savedItem);
    }
    
    public void deleteInventoryItem(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        InventoryItem item = inventoryItemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        
        if (!item.getTenantId().equals(tenantId) || item.isDeleted()) {
            throw new RuntimeException("Inventory item not found");
        }
        
        item.softDelete();
        inventoryItemRepository.save(item);
    }
    
    public List<InventoryItemDto> getLowStockItems() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        List<InventoryItem> items = inventoryItemRepository.findLowStockItems(tenantId);
        return items.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<InventoryItemDto> getOverstockedItems() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        List<InventoryItem> items = inventoryItemRepository.findOverstockedItems(tenantId);
        return items.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public List<InventoryItemDto> searchInventoryItems(String searchTerm) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        List<InventoryItem> items = inventoryItemRepository.findByItemNameContaining(tenantId, searchTerm);
        return items.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    private InventoryItemDto convertToDto(InventoryItem item) {
        InventoryItemDto dto = new InventoryItemDto();
        dto.setId(item.getId());
        dto.setItemCode(item.getItemCode());
        dto.setItemName(item.getItemName());
        dto.setDescription(item.getDescription());
        dto.setCategoryId(item.getCategory().getId());
        dto.setCategoryName(item.getCategory().getCategoryName());
        dto.setSupplierId(item.getSupplier().getId());
        dto.setSupplierName(item.getSupplier().getSupplierName());
        dto.setDepartmentId(item.getDepartment().getDepartmentId());
        dto.setDepartmentName(item.getDepartment().getDisplayName());
        dto.setUnitOfMeasure(item.getUnitOfMeasure());
        dto.setCurrentStock(item.getCurrentStock());
        dto.setMinimumStockLevel(item.getMinimumStockLevel());
        dto.setMaximumStockLevel(item.getMaximumStockLevel());
        dto.setUnitCost(item.getUnitCost());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setBarcode(item.getBarcode());
        dto.setIsActive(item.getIsActive());
        dto.setIsControlledSubstance(item.getIsControlledSubstance());
        dto.setRequiresPrescription(item.getRequiresPrescription());
        dto.setStorageLocation(item.getStorageLocation());
        dto.setExpiryDate(item.getExpiryDate());
        dto.setBatchNumber(item.getBatchNumber());
        dto.setNotes(item.getNotes());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        return dto;
    }
}
