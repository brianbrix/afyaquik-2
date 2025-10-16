package com.afyaquik.hms.diagnostics.service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.billing.domain.Bill;
import com.afyaquik.hms.billing.domain.BillItem;
import com.afyaquik.hms.billing.domain.BillStatus;
import com.afyaquik.hms.billing.repository.BillRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.diagnostics.domain.DiagnosticItem;
import com.afyaquik.hms.diagnostics.domain.DiagnosticOrder;
import com.afyaquik.hms.diagnostics.repository.DiagnosticOrderRepository;

@Service
@Transactional
public class DiagnosticBillingService {

    private static final Logger log = LoggerFactory.getLogger(DiagnosticBillingService.class);

    @Autowired
    private BillRepository billRepository;


    @Autowired
    private DiagnosticOrderRepository diagnosticOrderRepository;

    /**
     * Add diagnostic test prices to bill when order is completed.
     */
    public void addDiagnosticItemsToBill(Long diagnosticOrderId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        DiagnosticOrder order = diagnosticOrderRepository.findById(diagnosticOrderId)
            .orElseThrow(() -> new RuntimeException("Diagnostic order not found: " + diagnosticOrderId));
        
        if (!order.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to diagnostic order in another tenant");
        }

        // Find or create bill for this queue item
        Bill bill = findOrCreateBill(tenantId, order.getQueueItemId(), order.getPatientId());
        
        // Add each diagnostic item to the bill
        for (DiagnosticItem diagnosticItem : order.getDiagnosticItems()) {
            // Check if this item is already on the bill
            boolean itemExists = bill.getItems().stream()
                .anyMatch(item -> item.getDescription().contains(diagnosticItem.getTestCatalog().getTestName()) 
                    && item.getNotes() != null && item.getNotes().contains("Diagnostic Order: " + order.getOrderNumber()));

            if (!itemExists) {
                BillItem billItem = new BillItem();
                billItem.setTenantId(tenantId);
                billItem.setItemCode("DX-" + diagnosticItem.getTestCatalog().getId());
                billItem.setDescription(diagnosticItem.getTestCatalog().getTestName() + " (" + diagnosticItem.getTestCatalog().getTestType() + ")");
                billItem.setQuantity(BigDecimal.ONE);
                billItem.setUnitPrice(diagnosticItem.getCost() != null ? diagnosticItem.getCost() : diagnosticItem.getTestCatalog().getCost());
                billItem.setServiceCategory("DIAGNOSTICS");
                billItem.setNotes("Diagnostic Order: " + order.getOrderNumber() + 
                    " | Department: " + diagnosticItem.getTestCatalog().getDepartment() +
                    " | Test Type: " + diagnosticItem.getTestCatalog().getTestType());
                
                // Calculate line total
                billItem.calculateLineTotal();
                
                // Add to bill
                bill.addItem(billItem);
            }
        }

        // Save the updated bill
        billRepository.save(bill);
        log.info("Added diagnostic items to bill for order {}", order.getOrderNumber());
    }

    /**
     * Remove diagnostic test prices from bill when order is reopened.
     */
    public void removeDiagnosticItemsFromBill(Long diagnosticOrderId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        DiagnosticOrder order = diagnosticOrderRepository.findById(diagnosticOrderId)
            .orElseThrow(() -> new RuntimeException("Diagnostic order not found: " + diagnosticOrderId));
        
        if (!order.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to diagnostic order in another tenant");
        }

        // Find bill for this queue item
        List<Bill> bills = billRepository.findByTenantIdAndQueueItemIdOrderByCreatedAtDesc(tenantId, order.getQueueItemId());
        
        for (Bill bill : bills) {
            // Remove items that match this diagnostic order
            bill.getItems().removeIf(item -> 
                item.getNotes() != null && 
                item.getNotes().contains("Diagnostic Order: " + order.getOrderNumber()) &&
                item.getServiceCategory().equals("DIAGNOSTICS")
            );
            
            // Recalculate bill totals
            bill.recalculateAmounts();
            billRepository.save(bill);
        }
        
        log.info("Removed diagnostic items from bill for order {}", order.getOrderNumber());
    }

    /**
     * Find existing bill for queue item or create a new one.
     */
    private Bill findOrCreateBill(String tenantId, Long queueItemId, Long patientId) {
        // Try to find existing bill for this queue item
        List<Bill> existingBills = billRepository.findByTenantIdAndQueueItemIdOrderByCreatedAtDesc(tenantId, queueItemId);
        
        if (!existingBills.isEmpty()) {
            return existingBills.get(0); // Return the most recent bill
        }

        // Create new bill
        Bill bill = new Bill();
        bill.setTenantId(tenantId);
        bill.setBillNumber(generateBillNumber());
        bill.setPatientId(patientId);
        bill.setPatientName("Patient " + patientId); // Will be updated when patient name is available
        bill.setQueueItemId(queueItemId);
        bill.setStatus(BillStatus.DRAFT);
        bill.setBillingDate(OffsetDateTime.now());
        bill.setDueDate(OffsetDateTime.now().plusDays(30)); // 30 days from now
        bill.setPaymentTerms("Net 30");
        bill.setNotes("Bill created automatically for diagnostic tests");

        return billRepository.save(bill);
    }

    /**
     * Generate unique bill number.
     */
    private String generateBillNumber() {
        return "BILL-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
    }
}
