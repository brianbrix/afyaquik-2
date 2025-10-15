package com.afyaquik.hms.pharmacy.service;

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
import com.afyaquik.hms.pharmacy.domain.Prescription;
import com.afyaquik.hms.pharmacy.domain.PrescriptionItem;
import com.afyaquik.hms.pharmacy.repository.PrescriptionItemRepository;
import com.afyaquik.hms.pharmacy.repository.PrescriptionRepository;

@Service
@Transactional
public class PrescriptionBillingService {
    private static final Logger log = LoggerFactory.getLogger(PrescriptionBillingService.class);

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PrescriptionItemRepository prescriptionItemRepository;

    /**
     * Add dispensed prescription items to the patient's bill.
     * Creates a new bill if one doesn't exist for the queue item.
     */
    public void addPrescriptionToBill(Long prescriptionId, Long queueItemId, Long patientId, String patientName) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        // Get the prescription
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
            .orElseThrow(() -> new RuntimeException("Prescription not found"));
        
        if (!prescription.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to prescription in another tenant");
        }

        // Find or create bill for this queue item
        Bill bill = findOrCreateBill(tenantId, queueItemId, patientId, patientName);

        // Get prescription items
        List<PrescriptionItem> prescriptionItems = prescriptionItemRepository.findByTenantIdAndPrescriptionId(tenantId, prescriptionId);

        // Add each prescription item to the bill
        for (PrescriptionItem prescriptionItem : prescriptionItems) {
            // Check if this item is already on the bill
            boolean itemExists = bill.getItems().stream()
                .anyMatch(item -> item.getDescription().contains(prescriptionItem.getMedication().getName()) 
                    && item.getNotes() != null && item.getNotes().contains("Prescription: " + prescription.getPrescriptionNumber()));

            if (!itemExists) {
                BillItem billItem = new BillItem();
                billItem.setTenantId(tenantId); // Set tenant ID explicitly
                billItem.setItemCode("MED-" + prescriptionItem.getMedication().getMedicationCode());
                billItem.setDescription(prescriptionItem.getMedication().getName() + " (" + prescriptionItem.getDosageInstructions() + ")");
                billItem.setQuantity(BigDecimal.valueOf(prescriptionItem.getQuantityPrescribed()));
                log.info("Unit price: {}", prescriptionItem.getUnitPrice());
                billItem.setUnitPrice(prescriptionItem.getUnitPrice());
                billItem.setServiceCategory("PHARMACY");
                billItem.setNotes("Prescription: " + prescription.getPrescriptionNumber() + 
                    " | Frequency: " + prescriptionItem.getFrequency() +
                    (prescriptionItem.getDurationDays() != null ? " | Duration: " + prescriptionItem.getDurationDays() + " days" : ""));
                
                // Calculate line total
                billItem.calculateLineTotal();
                
                // Add to bill
                bill.addItem(billItem);
            }
        }

        // Save the updated bill
        billRepository.save(bill);
    }

    /**
     * Find existing bill for queue item or create a new one.
     */
    private Bill findOrCreateBill(String tenantId, Long queueItemId, Long patientId, String patientName) {
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
        bill.setPatientName(patientName);
        bill.setQueueItemId(queueItemId);
        bill.setStatus(BillStatus.DRAFT);
        bill.setBillingDate(OffsetDateTime.now());
        bill.setDueDate(OffsetDateTime.now().plusDays(30)); // 30 days from now
        bill.setPaymentTerms("Net 30");
        bill.setNotes("Bill created automatically for prescription dispensing");

        return billRepository.save(bill);
    }

    /**
     * Reverse billing for a replaced prescription.
     * Marks prescription items as VOIDED instead of removing them from the bill.
     */
    public void reversePrescriptionBilling(Long prescriptionId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        // Get the prescription
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
            .orElseThrow(() -> new RuntimeException("Prescription not found"));
        
        if (!prescription.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access denied to prescription in another tenant");
        }

        // Find bill for this queue item
        if (prescription.getQueueItemId() != null) {
            List<Bill> bills = billRepository.findByTenantIdAndQueueItemIdOrderByCreatedAtDesc(tenantId, prescription.getQueueItemId());
            
            if (!bills.isEmpty()) {
                Bill bill = bills.get(0); // Get the most recent bill
                
                // Get prescription items
                List<PrescriptionItem> prescriptionItems = prescriptionItemRepository.findByTenantIdAndPrescriptionId(tenantId, prescriptionId);
                
                // Mark prescription items as VOIDED instead of removing them
                for (PrescriptionItem prescriptionItem : prescriptionItems) {
                    // Find the corresponding bill item and mark it as VOIDED
                    bill.getItems().stream()
                        .filter(item -> 
                            item.getDescription().contains(prescriptionItem.getMedication().getName()) 
                            && item.getNotes() != null 
                            && item.getNotes().contains("Prescription: " + prescription.getPrescriptionNumber())
                        )
                        .forEach(item -> {
                            // Mark as VOIDED by updating the description and notes
                            item.setDescription("VOIDED: " + item.getDescription());
                            item.setNotes(item.getNotes() + " | VOIDED - Prescription replaced on " + java.time.LocalDateTime.now().toString());
                            
                            // Set quantity to negative to act like a discount
                            item.setQuantity(item.getQuantity().negate());
                            
                            // Recalculate line total (will be negative)
                            item.calculateLineTotal();
                        });
                }
                
                // Update bill totals
                bill.recalculateAmounts();
                
                // Save the updated bill
                billRepository.save(bill);
            }
        }
    }

    /**
     * Generate a unique bill number.
     */
    private String generateBillNumber() {
        return "BILL-" + System.currentTimeMillis();
    }
}
