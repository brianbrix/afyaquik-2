package com.afyaquik.hms.billing.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.billing.domain.Bill;
import com.afyaquik.hms.billing.domain.BillItem;
import com.afyaquik.hms.billing.dto.BillItemDto;
import com.afyaquik.hms.billing.dto.CreateBillItemRequest;
import com.afyaquik.hms.billing.repository.BillItemRepository;
import com.afyaquik.hms.billing.repository.BillRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

@Service
@Transactional
public class BillItemService {

    @Autowired
    private BillItemRepository billItemRepository;

    @Autowired
    private BillRepository billRepository;

    /**
     * Get all bill items for a specific bill.
     */
    @Transactional(readOnly = true)
    public List<BillItemDto> getBillItems(Long billId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        // Verify bill exists and belongs to tenant
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Bill not found"));
        
        if (!bill.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to bill in another tenant");
        }

        return billItemRepository.findByTenantIdAndBillId(tenantId, billId)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    /**
     * Add a new item to a bill.
     */
    public BillItemDto addBillItem(Long billId, CreateBillItemRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        // Verify bill exists and belongs to tenant
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Bill not found"));
        
        if (!bill.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to bill in another tenant");
        }

        // Create bill item
        BillItem billItem = new BillItem();
        billItem.setTenantId(tenantId);
        billItem.setBill(bill);
        billItem.setItemCode(request.getItemCode());
        billItem.setDescription(request.getDescription());
        billItem.setQuantity(request.getQuantity());
        billItem.setUnitPrice(request.getUnitPrice());
        billItem.setDiscountPercentage(request.getDiscountPercentage() != null ? request.getDiscountPercentage() : BigDecimal.ZERO);
        billItem.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
        billItem.setTaxRate(request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.ZERO);
        billItem.setServiceCategory(request.getServiceCategory());
        billItem.setNotes(request.getNotes());

        // Calculate line total
        billItem.calculateLineTotal();

        // Save bill item
        BillItem savedItem = billItemRepository.save(billItem);

        // Update bill totals
        bill.recalculateAmounts();
        billRepository.save(bill);

        return convertToDto(savedItem);
    }

    /**
     * Update an existing bill item.
     */
    public BillItemDto updateBillItem(Long billId, Long itemId, CreateBillItemRequest request) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        // Verify bill exists and belongs to tenant
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Bill not found"));
        
        if (!bill.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to bill in another tenant");
        }

        // Find bill item
        BillItem billItem = billItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Bill item not found"));
        
        if (!billItem.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to bill item in another tenant");
        }

        // Update bill item
        billItem.setItemCode(request.getItemCode());
        billItem.setDescription(request.getDescription());
        billItem.setQuantity(request.getQuantity());
        billItem.setUnitPrice(request.getUnitPrice());
        billItem.setDiscountPercentage(request.getDiscountPercentage() != null ? request.getDiscountPercentage() : BigDecimal.ZERO);
        billItem.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
        billItem.setTaxRate(request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.ZERO);
        billItem.setServiceCategory(request.getServiceCategory());
        billItem.setNotes(request.getNotes());

        // Recalculate line total
        billItem.calculateLineTotal();

        // Save bill item
        BillItem savedItem = billItemRepository.save(billItem);

        // Update bill totals
        bill.recalculateAmounts();
        billRepository.save(bill);

        return convertToDto(savedItem);
    }

    /**
     * Delete a bill item.
     */
    public void deleteBillItem(Long billId, Long itemId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        // Verify bill exists and belongs to tenant
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Bill not found"));
        
        if (!bill.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to bill in another tenant");
        }

        // Find bill item
        BillItem billItem = billItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Bill item not found"));
        
        if (!billItem.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to bill item in another tenant");
        }

        // Soft delete bill item
        billItem.softDelete();
        billItemRepository.save(billItem);

        // Update bill totals
        bill.recalculateAmounts();
        billRepository.save(bill);
    }

    /**
     * Convert BillItem entity to DTO.
     */
    private BillItemDto convertToDto(BillItem billItem) {
        BillItemDto dto = new BillItemDto();
        dto.setId(billItem.getId());
        dto.setItemCode(billItem.getItemCode());
        dto.setDescription(billItem.getDescription());
        dto.setQuantity(billItem.getQuantity());
        dto.setUnitPrice(billItem.getUnitPrice());
        dto.setDiscountPercentage(billItem.getDiscountPercentage());
        dto.setDiscountAmount(billItem.getDiscountAmount());
        dto.setTaxRate(billItem.getTaxRate());
        dto.setTaxAmount(billItem.getTaxAmount());
        dto.setLineTotal(billItem.getLineTotal());
        dto.setServiceCategory(billItem.getServiceCategory());
        dto.setNotes(billItem.getNotes());
        dto.setCreatedAt(billItem.getCreatedAt());
        dto.setUpdatedAt(billItem.getUpdatedAt());
        return dto;
    }
}
