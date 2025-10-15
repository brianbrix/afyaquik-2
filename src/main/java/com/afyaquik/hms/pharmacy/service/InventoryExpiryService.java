package com.afyaquik.hms.pharmacy.service;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.pharmacy.domain.Inventory;
import com.afyaquik.hms.pharmacy.repository.InventoryRepository;
import com.afyaquik.hms.pharmacy.service.StockManagementService;
import com.afyaquik.hms.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class InventoryExpiryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private com.afyaquik.hms.notification.service.UserPermissionService userPermissionService;

    @Autowired
    private StockManagementService stockManagementService;

    @Value("${afyaquik.default-admin.tenant}")
    private String tenantId;

    /**
     * Run daily at 2 AM to check for expired inventory
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void processExpiredInventory() {
        List<Inventory> expiredBatches = inventoryRepository.findExpiredBatchesByTenantId(tenantId);
        
        for (Inventory inventory : expiredBatches) {
            // Deactivate expired inventory
            inventory.setActive(false);
            inventory.setNotes(inventory.getNotes() + "\n[SYSTEM] Batch expired and deactivated on " + LocalDate.now());
            inventoryRepository.save(inventory);
            
            // Send notification to users with MANAGE_MEDICATION_INVENTORY permission
            sendInventoryExpiryNotification(inventory);
        }
    }

    /**
     * Check for inventory that will expire soon (within 30 days)
     */
    @Scheduled(cron = "0 0 9 * * ?") // Run daily at 9 AM
    public void checkExpiringInventory() {
        LocalDate expiryThreshold = LocalDate.now().plusDays(30);
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        List<Inventory> expiringBatches = inventoryRepository.findExpiringByTenantId(tenantId, expiryThreshold);
        
        for (Inventory inventory : expiringBatches) {
            sendInventoryExpiryWarningNotification(inventory);
        }
    }

    /**
     * Check for low stock and send notifications
     */
    @Scheduled(cron = "0 0 10 * * ?") // Run daily at 10 AM
    public void checkLowStock() {
        stockManagementService.checkAllMedicationsForLowStock(tenantId);
    }

    /**
     * Send inventory expiry notification using the proper notification service
     */
    private void sendInventoryExpiryNotification(Inventory inventory) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("medicationName", inventory.getMedication().getName());
        variables.put("batchNumber", inventory.getBatchNumber());
        variables.put("expiryDate", inventory.getExpiryDate());
        
        // Send notification to users with MANAGE_MEDICATION_INVENTORY permission
        List<String> usersWithPermission = userPermissionService.findUsersWithPermission("MANAGE_MEDICATION_INVENTORY");
        
        if (usersWithPermission.isEmpty()) {
            // Fallback to admin if no users found
            usersWithPermission = List.of("admin");
        }
        
        // Send notification to all users with the permission
        for (String username : usersWithPermission) {
            notificationService.sendNotification(
                "INVENTORY_EXPIRED", 
                variables, 
                username,
                "IN_APP"
            );
        }
    }

    /**
     * Send inventory expiry warning notification using the proper notification service
     */
    private void sendInventoryExpiryWarningNotification(Inventory inventory) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("medicationName", inventory.getMedication().getName());
        variables.put("batchNumber", inventory.getBatchNumber());
        variables.put("expiryDate", inventory.getExpiryDate());
        variables.put("daysUntilExpiry", java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), inventory.getExpiryDate()));
        
        // Send notification to users with MANAGE_MEDICATION_INVENTORY permission
        List<String> usersWithPermission = userPermissionService.findUsersWithPermission("MANAGE_MEDICATION_INVENTORY");
        
        if (usersWithPermission.isEmpty()) {
            // Fallback to admin if no users found
            usersWithPermission = List.of("admin");
        }
        
        // Send notification to all users with the permission
        for (String username : usersWithPermission) {
            notificationService.sendNotification(
                "INVENTORY_EXPIRING_WARNING", 
                variables, 
                username,
                "IN_APP"
            );
        }
    }
}
