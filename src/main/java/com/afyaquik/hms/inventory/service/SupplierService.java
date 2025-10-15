package com.afyaquik.hms.inventory.service;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.inventory.domain.Supplier;
import com.afyaquik.hms.inventory.dto.SupplierDto;
import com.afyaquik.hms.inventory.dto.SupplierRequest;
import com.afyaquik.hms.inventory.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SupplierService {
    
    @Autowired
    private SupplierRepository supplierRepository;
    
    public List<SupplierDto> getAllSuppliers() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        List<Supplier> suppliers = supplierRepository.findByTenantIdAndDeletedFalse(tenantId);
        return suppliers.stream().map(this::convertToDto).collect(Collectors.toList());
    }
    
    public SupplierDto getSupplierById(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found"));
        
        if (!supplier.getTenantId().equals(tenantId) || supplier.isDeleted()) {
            throw new RuntimeException("Supplier not found");
        }
        
        return convertToDto(supplier);
    }
    
    public SupplierDto createSupplier(SupplierRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        // Check if supplier name already exists
        if (supplierRepository.findByTenantIdAndSupplierNameAndDeletedFalse(tenantId, request.getSupplierName()).isPresent()) {
            throw new RuntimeException("Supplier name already exists");
        }
        
        // Check if email already exists (if provided)
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (supplierRepository.findByEmail(tenantId, request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }
        }
        
        Supplier supplier = new Supplier();
        supplier.setTenantId(tenantId);
        supplier.setSupplierName(request.getSupplierName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setCity(request.getCity());
        supplier.setState(request.getState());
        supplier.setPostalCode(request.getPostalCode());
        supplier.setCountry(request.getCountry());
        supplier.setTaxId(request.getTaxId());
        supplier.setPaymentTerms(request.getPaymentTerms());
        supplier.setCreditLimit(request.getCreditLimit());
        supplier.setIsActive(request.getIsActive());
        supplier.setNotes(request.getNotes());
        
        Supplier savedSupplier = supplierRepository.save(supplier);
        return convertToDto(savedSupplier);
    }
    
    public SupplierDto updateSupplier(Long id, SupplierRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found"));
        
        if (!supplier.getTenantId().equals(tenantId) || supplier.isDeleted()) {
            throw new RuntimeException("Supplier not found");
        }
        
        // Check if supplier name already exists (excluding current supplier)
        supplierRepository.findByTenantIdAndSupplierNameAndDeletedFalse(tenantId, request.getSupplierName())
            .ifPresent(existingSupplier -> {
                if (!existingSupplier.getId().equals(id)) {
                    throw new RuntimeException("Supplier name already exists");
                }
            });
        
        // Check if email already exists (excluding current supplier)
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            supplierRepository.findByEmail(tenantId, request.getEmail())
                .ifPresent(existingSupplier -> {
                    if (!existingSupplier.getId().equals(id)) {
                        throw new RuntimeException("Email already exists");
                    }
                });
        }
        
        supplier.setSupplierName(request.getSupplierName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setCity(request.getCity());
        supplier.setState(request.getState());
        supplier.setPostalCode(request.getPostalCode());
        supplier.setCountry(request.getCountry());
        supplier.setTaxId(request.getTaxId());
        supplier.setPaymentTerms(request.getPaymentTerms());
        supplier.setCreditLimit(request.getCreditLimit());
        supplier.setIsActive(request.getIsActive());
        supplier.setNotes(request.getNotes());
        
        Supplier savedSupplier = supplierRepository.save(supplier);
        return convertToDto(savedSupplier);
    }
    
    public void deleteSupplier(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found"));
        
        if (!supplier.getTenantId().equals(tenantId) || supplier.isDeleted()) {
            throw new RuntimeException("Supplier not found");
        }
        
        supplier.softDelete();
        supplierRepository.save(supplier);
    }
    
    private SupplierDto convertToDto(Supplier supplier) {
        SupplierDto dto = new SupplierDto();
        dto.setId(supplier.getId());
        dto.setSupplierName(supplier.getSupplierName());
        dto.setContactPerson(supplier.getContactPerson());
        dto.setEmail(supplier.getEmail());
        dto.setPhone(supplier.getPhone());
        dto.setAddress(supplier.getAddress());
        dto.setCity(supplier.getCity());
        dto.setState(supplier.getState());
        dto.setPostalCode(supplier.getPostalCode());
        dto.setCountry(supplier.getCountry());
        dto.setTaxId(supplier.getTaxId());
        dto.setPaymentTerms(supplier.getPaymentTerms());
        dto.setCreditLimit(supplier.getCreditLimit());
        dto.setIsActive(supplier.getIsActive());
        dto.setNotes(supplier.getNotes());
        dto.setCreatedAt(supplier.getCreatedAt());
        dto.setUpdatedAt(supplier.getUpdatedAt());
        return dto;
    }
}

