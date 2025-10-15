package com.afyaquik.hms.pharmacy.service;

import com.afyaquik.hms.pharmacy.domain.Inventory;
import com.afyaquik.hms.pharmacy.domain.PrescriptionItem;
import com.afyaquik.hms.pharmacy.repository.InventoryRepository;
import com.afyaquik.hms.pharmacy.repository.PrescriptionItemRepository;
import com.afyaquik.hms.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
public class StockManagementService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private PrescriptionItemRepository prescriptionItemRepository;

    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private com.afyaquik.hms.notification.service.UserPermissionService userPermissionService;

    private static final Random RANDOM = new Random();

    /**
     * Deduct stock when prescription items are dispensed
     */
    public void deductStockForPrescription(String tenantId, Long prescriptionId) {
        List<PrescriptionItem> prescriptionItems = prescriptionItemRepository
                .findByTenantIdAndPrescriptionId(tenantId, prescriptionId);

        for (PrescriptionItem item : prescriptionItems) {
            deductStockForMedication(tenantId, item.getMedication().getId(), 
                    item.getQuantityDispensed(), 
                    "Dispensed for prescription #" + item.getPrescription().getPrescriptionNumber());
        }
    }

    /**
     * Deduct stock for a specific medication
     */
    public void deductStockForMedication(String tenantId, Long medicationId, Integer quantity, String reason) {
        if (quantity == null || quantity <= 0) {
            return;
        }

        // Find inventory for this medication
        Optional<Inventory> inventoryOpt = inventoryRepository
                .findByTenantIdAndMedicationId(tenantId, medicationId);

        if (inventoryOpt.isEmpty()) {
            throw new IllegalStateException("No inventory found for medication ID: " + medicationId);
        }

        Inventory inventory = inventoryOpt.get();
        
        // Check if sufficient stock is available
        if (inventory.getQuantityInStock() < quantity) {
            throw new IllegalStateException(
                String.format("Insufficient stock for medication %s. Available: %d, Required: %d", 
                    inventory.getMedication().getName(), 
                    inventory.getQuantityInStock(), 
                    quantity)
            );
        }

        // Deduct the stock
        int newQuantity = inventory.getQuantityInStock() - quantity;
        inventory.setQuantityInStock(newQuantity);

        // Add notes about the deduction
        String existingNotes = inventory.getNotes();
        String newNotes = String.format("[%s] Stock deducted: -%d (%s)", 
            LocalDateTime.now().toString(), quantity, reason);
        
        if (existingNotes != null && !existingNotes.trim().isEmpty()) {
            inventory.setNotes(existingNotes + "\n" + newNotes);
        } else {
            inventory.setNotes(newNotes);
        }

        inventoryRepository.save(inventory);
    }

    /**
     * Restore stock when prescription is cancelled
     */
    public void restoreStockForPrescription(String tenantId, Long prescriptionId) {
        List<PrescriptionItem> prescriptionItems = prescriptionItemRepository
                .findByTenantIdAndPrescriptionId(tenantId, prescriptionId);

        for (PrescriptionItem item : prescriptionItems) {
            if (item.getQuantityDispensed() != null && item.getQuantityDispensed() > 0) {
                restoreStockForMedication(tenantId, item.getMedication().getId(), 
                        item.getQuantityDispensed(), 
                        "Restored from cancelled prescription #" + item.getPrescription().getPrescriptionNumber());
            }
        }
    }

    /**
     * Restore stock for a specific medication
     */
    public void restoreStockForMedication(String tenantId, Long medicationId, Integer quantity, String reason) {
        if (quantity == null || quantity <= 0) {
            return;
        }

        // Find inventory for this medication
        Optional<Inventory> inventoryOpt = inventoryRepository
                .findByTenantIdAndMedicationId(tenantId, medicationId);

        if (inventoryOpt.isEmpty()) {
            throw new IllegalStateException("No inventory found for medication ID: " + medicationId);
        }

        Inventory inventory = inventoryOpt.get();
        
        // Restore the stock
        int newQuantity = inventory.getQuantityInStock() + quantity;
        inventory.setQuantityInStock(newQuantity);

        // Add notes about the restoration
        String existingNotes = inventory.getNotes();
        String newNotes = String.format("[%s] Stock restored: +%d (%s)", 
            LocalDateTime.now().toString(), quantity, reason);
        
        if (existingNotes != null && !existingNotes.trim().isEmpty()) {
            inventory.setNotes(existingNotes + "\n" + newNotes);
        } else {
            inventory.setNotes(newNotes);
        }

        inventoryRepository.save(inventory);
    }

    /**
     * Check if sufficient stock is available for dispensing
     */
    public boolean checkStockAvailability(String tenantId, Long medicationId, Integer requiredQuantity) {
        if (requiredQuantity == null || requiredQuantity <= 0) {
            return true;
        }

        Optional<Inventory> inventoryOpt = inventoryRepository
                .findByTenantIdAndMedicationId(tenantId, medicationId);

        if (inventoryOpt.isEmpty()) {
            return false;
        }

        Inventory inventory = inventoryOpt.get();
        return inventory.getQuantityInStock() >= requiredQuantity;
    }

    /**
     * Get stock level for a medication
     */
    public Integer getStockLevel(String tenantId, Long medicationId) {
        Optional<Inventory> inventoryOpt = inventoryRepository
                .findByTenantIdAndMedicationId(tenantId, medicationId);

        if (inventoryOpt.isEmpty()) {
            return 0;
        }

        return inventoryOpt.get().getQuantityInStock();
    }

    /**
     * Check stock availability for all items in a prescription
     */
    public boolean checkPrescriptionStockAvailability(String tenantId, Long prescriptionId) {
        List<PrescriptionItem> prescriptionItems = prescriptionItemRepository
                .findByTenantIdAndPrescriptionId(tenantId, prescriptionId);

        for (PrescriptionItem item : prescriptionItems) {
            if (!checkStockAvailability(tenantId, item.getMedication().getId(), item.getQuantityPrescribed())) {
                return false;
            }
        }

        return true;
    }

    /**
     * Generate a unique batch number for medication inventory
     */
    public String generateBatchNumber(String tenantId, Long medicationId) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = String.format("%03d", RANDOM.nextInt(1000));
        String baseBatch = "B" + timestamp + randomSuffix;
        
        // Ensure uniqueness by checking existing batches
        int counter = 1;
        String batchNumber = baseBatch;
        while (inventoryRepository.existsByTenantIdAndBatchNumber(tenantId, batchNumber)) {
            batchNumber = baseBatch + "-" + counter;
            counter++;
        }
        
        return batchNumber;
    }

    /**
     * Validate batch number format and uniqueness
     */
    public boolean validateBatchNumber(String tenantId, String batchNumber, Long excludeInventoryId) {
        if (batchNumber == null || batchNumber.trim().isEmpty()) {
            return false;
        }
        
    
        
        // Check uniqueness (excluding current record if editing)
        if (excludeInventoryId != null) {
            return !inventoryRepository.existsByTenantIdAndBatchNumberAndIdNot(tenantId, batchNumber, excludeInventoryId);
        } else {
            return !inventoryRepository.existsByTenantIdAndBatchNumber(tenantId, batchNumber);
        }
    }

    /**
     * Check stock availability across all active, unexpired batches for a medication
     */
    public boolean checkStockAvailabilityAcrossBatches(String tenantId, Long medicationId, Integer requiredQuantity) {
        if (requiredQuantity == null || requiredQuantity <= 0) {
            return true;
        }

        List<Inventory> activeBatches = inventoryRepository.findActiveUnexpiredBatchesByTenantIdAndMedicationId(tenantId, medicationId);
        
        int totalAvailableStock = activeBatches.stream()
                .mapToInt(Inventory::getQuantityInStock)
                .sum();
        
        return totalAvailableStock >= requiredQuantity;
    }

    /**
     * Get total stock level across all active, unexpired batches for a medication
     */
    public Integer getTotalStockLevelAcrossBatches(String tenantId, Long medicationId) {
        List<Inventory> activeBatches = inventoryRepository.findActiveUnexpiredBatchesByTenantIdAndMedicationId(tenantId, medicationId);
        
        return activeBatches.stream()
                .mapToInt(Inventory::getQuantityInStock)
                .sum();
    }

    /**
     * Get aggregate minimum stock level for a medication (sum of all minimum levels)
     */
    public Integer getAggregateMinimumStockLevel(String tenantId, Long medicationId) {
        List<Inventory> activeBatches = inventoryRepository.findActiveUnexpiredBatchesByTenantIdAndMedicationId(tenantId, medicationId);
        
        return activeBatches.stream()
                .mapToInt(Inventory::getMinimumStockLevel)
                .sum();
    }

    /**
     * Check if total stock is below aggregate minimum level
     */
    public boolean isStockBelowMinimum(String tenantId, Long medicationId) {
        int totalStock = getTotalStockLevelAcrossBatches(tenantId, medicationId);
        int aggregateMinimum = getAggregateMinimumStockLevel(tenantId, medicationId);
        
        return totalStock < aggregateMinimum;
    }

    /**
     * Deduct stock from multiple batches using FIFO (First In, First Out) approach
     */
    public void deductStockFromBatches(String tenantId, Long medicationId, Integer quantity, String reason) {
        if (quantity == null || quantity <= 0) {
            return;
        }

        List<Inventory> activeBatches = inventoryRepository.findActiveUnexpiredBatchesByTenantIdAndMedicationIdOrderByExpiryDate(tenantId, medicationId);
        
        int remainingQuantity = quantity;
        
        for (Inventory batch : activeBatches) {
            if (remainingQuantity <= 0) break;
            
            int availableInBatch = batch.getQuantityInStock();
            int deductFromBatch = Math.min(remainingQuantity, availableInBatch);
            
            if (deductFromBatch > 0) {
                batch.setQuantityInStock(availableInBatch - deductFromBatch);
                
                // Mark as used in prescriptions
                batch.setUsedInPrescriptions(true);
                
                // Add notes about the deduction
                String existingNotes = batch.getNotes();
                String newNotes = String.format("[%s] Stock deducted: -%d from batch %s (%s)", 
                    LocalDateTime.now().toString(), deductFromBatch, batch.getBatchNumber(), reason);
                
                if (existingNotes != null && !existingNotes.trim().isEmpty()) {
                    batch.setNotes(existingNotes + "\n" + newNotes);
                } else {
                    batch.setNotes(newNotes);
                }
                
                inventoryRepository.save(batch);
                remainingQuantity -= deductFromBatch;
            }
        }
        
        if (remainingQuantity > 0) {
            throw new IllegalStateException(
                String.format("Insufficient stock across all batches. Required: %d, Available: %d", 
                    quantity, quantity - remainingQuantity)
            );
        }
    }

    /**
     * Check all medications for low stock and send notifications
     */
    public void checkAllMedicationsForLowStock(String tenantId) {
        List<Long> medicationIds = inventoryRepository.findDistinctMedicationIdsByTenantId(tenantId);
        
        for (Long medicationId : medicationIds) {
            if (isStockBelowMinimum(tenantId, medicationId)) {
                sendLowStockNotification(tenantId, medicationId);
            }
        }
    }

    /**
     * Send low stock notification using the proper notification service
     */
    private void sendLowStockNotification(String tenantId, Long medicationId) {
        List<Inventory> activeBatches = inventoryRepository.findActiveUnexpiredBatchesByTenantIdAndMedicationId(tenantId, medicationId);
        
        if (activeBatches.isEmpty()) {
            return;
        }
        
        // Calculate total stock and aggregate minimum
        int totalStock = activeBatches.stream().mapToInt(Inventory::getQuantityInStock).sum();
        int aggregateMinimum = activeBatches.stream().mapToInt(Inventory::getMinimumStockLevel).sum();
        
        if (totalStock < aggregateMinimum) {
            String medicationName = activeBatches.get(0).getMedication().getName();
            
            Map<String, Object> variables = new HashMap<>();
            variables.put("medicationName", medicationName);
            variables.put("currentStock", totalStock);
            variables.put("minimumRequired", aggregateMinimum);
            variables.put("shortage", aggregateMinimum - totalStock);
            
            // Send notification to users with MANAGE_MEDICATION_INVENTORY permission
            List<String> usersWithPermission = userPermissionService.findUsersWithPermission("MANAGE_MEDICATION_INVENTORY");
            
            if (usersWithPermission.isEmpty()) {
                // Fallback to admin if no users found
                usersWithPermission = List.of("admin");
            }
            
            // Send notification to all users with the permission
            for (String username : usersWithPermission) {
                notificationService.sendNotification(
                    "LOW_STOCK_ALERT", 
                    variables, 
                    username,
                    "IN_APP"
                );
            }
        }
    }
}
