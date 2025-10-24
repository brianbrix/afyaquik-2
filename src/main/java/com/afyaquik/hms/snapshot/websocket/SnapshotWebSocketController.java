package com.afyaquik.hms.snapshot.websocket;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.afyaquik.hms.snapshot.domain.DeviceSnapshot;
import com.afyaquik.hms.snapshot.dto.SnapshotResponse;
import com.afyaquik.hms.snapshot.service.DeviceRegistrationService;
import com.afyaquik.hms.snapshot.service.SnapshotService;

@Controller
public class SnapshotWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(SnapshotWebSocketController.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private SnapshotService snapshotService;

    @Autowired
    private DeviceRegistrationService deviceRegistrationService;

    // Track connected devices per tenant
    private final Map<String, Map<String, DeviceConnection>> tenantConnections = new ConcurrentHashMap<>();

    /**
     * Handle device connection
     */
    @MessageMapping("/snapshot/connect")
    public void handleDeviceConnection(@Payload DeviceConnectionMessage message, 
                                     @Header("simpSessionAttributes") Map<String, Object> sessionAttributes) {
        try {
            String tenantId = (String) sessionAttributes.get("tenantId");
            String deviceId = message.getDeviceId();
            
            // Debug logging
            log.info("WebSocket connect - Device: {}, Session attributes: {}", deviceId, sessionAttributes);
            log.info("WebSocket connect - All session attributes:");
            for (Map.Entry<String, Object> entry : sessionAttributes.entrySet()) {
                log.info("  {} = {}", entry.getKey(), entry.getValue());
            }
            log.info("WebSocket connect - Tenant ID from session: {}", tenantId);
            
            // Handle null tenant ID
            if (tenantId == null) {
                log.error("Device {} connected but tenant ID is null. Rejecting connection.", deviceId);
                sendErrorToDevice(deviceId, "Tenant ID is required for WebSocket connection");
                return;
            }
            
            log.info("Device {} connected for tenant {}", deviceId, tenantId);
            
            // Register device connection
            registerDeviceConnection(tenantId, deviceId, message.getDeviceName());
            
            // Send connection acknowledgment
            ConnectionAcknowledgment ack = new ConnectionAcknowledgment();
            ack.setDeviceId(deviceId);
            ack.setStatus("connected");
            ack.setTimestamp(LocalDateTime.now());
            ack.setMessage("Device connected successfully");
            
            messagingTemplate.convertAndSendToUser(deviceId, "/queue/connection", ack);
            
            // Notify other devices about new connection
            notifyDevicesAboutConnection(tenantId, deviceId, message.getDeviceName());
            
        } catch (Exception e) {
            log.error("Error handling device connection", e);
            sendErrorToDevice(message.getDeviceId(), "Connection failed: " + e.getMessage());
        }
    }

    /**
     * Handle device disconnection
     */
    @MessageMapping("/snapshot/disconnect")
    public void handleDeviceDisconnection(@Payload DeviceConnectionMessage message,
                                        @Header("simpSessionAttributes") Map<String, Object> sessionAttributes) {
        try {
            String tenantId = (String) sessionAttributes.get("tenantId");
            String deviceId = message.getDeviceId();
            
            // Handle null tenant ID
            if (tenantId == null) {
                log.error("Device {} disconnected but tenant ID is null. Cannot process disconnection.", deviceId);
                return;
            }
            
            log.info("Device {} disconnected for tenant {}", deviceId, tenantId);
            
            // Remove device connection
            removeDeviceConnection(tenantId, deviceId);
            
            // Notify other devices about disconnection
            notifyDevicesAboutDisconnection(tenantId, deviceId);
            
        } catch (Exception e) {
            log.error("Error handling device disconnection", e);
        }
    }

    /**
     * Handle snapshot update requests
     */
    @MessageMapping("/snapshot/update")
    public void handleSnapshotUpdate(@Payload SnapshotUpdateMessage message,
                                   @Header("simpSessionAttributes") Map<String, Object> sessionAttributes) {
        try {
            String tenantId = (String) sessionAttributes.get("tenantId");
            String deviceId = message.getDeviceId();
            
            // Handle null tenant ID
            if (tenantId == null) {
                log.error("Snapshot update requested by device {} but tenant ID is null. Rejecting request.", deviceId);
                sendErrorToDevice(deviceId, "Tenant ID is required for snapshot operations");
                return;
            }
            
            log.debug("Snapshot update requested by device {} for tenant {}", deviceId, tenantId);
            
            // Check if data has changed
            LocalDateTime lastSync = message.getLastSyncTime();
            boolean hasChanges = snapshotService.hasDataChanged(tenantId, lastSync);
            
            if (hasChanges) {
                // Generate incremental snapshot
                DeviceSnapshot deviceSnapshot = snapshotService.createIncrementalSnapshot(deviceId, tenantId, lastSync);
                
                // Convert to response format
                SnapshotResponse snapshot = new SnapshotResponse();
                snapshot.setId(deviceSnapshot.getId());
                snapshot.setDeviceId(deviceSnapshot.getDeviceId());
                snapshot.setTenantId(deviceSnapshot.getTenantId());
                snapshot.setSnapshotType(deviceSnapshot.getSnapshotType().name());
                snapshot.setVersion(deviceSnapshot.getVersion());
                snapshot.setDataSize(deviceSnapshot.getDataSize());
                snapshot.setCreatedAt(deviceSnapshot.getCreatedAt().toString());
                snapshot.setSnapshotData(deviceSnapshot.getSnapshotData());
                snapshot.setIsCompressed(deviceSnapshot.getIsCompressed());
                snapshot.setChecksum(deviceSnapshot.getChecksum());
                
                // Send snapshot to requesting device
                messagingTemplate.convertAndSendToUser(deviceId, "/queue/snapshot", snapshot);
                
                // Notify other devices about data changes
                notifyDevicesAboutDataChange(tenantId, deviceId, "incremental_update");
            } else {
                // Send no changes message
                NoChangesMessage noChanges = new NoChangesMessage();
                noChanges.setDeviceId(deviceId);
                noChanges.setMessage("No changes since last sync");
                noChanges.setTimestamp(LocalDateTime.now());
                
                messagingTemplate.convertAndSendToUser(deviceId, "/queue/no-changes", noChanges);
            }
            
        } catch (Exception e) {
            log.error("Error handling snapshot update", e);
            sendErrorToDevice(message.getDeviceId(), "Snapshot update failed: " + e.getMessage());
        }
    }

    /**
     * Handle conflict resolution requests
     */
    @MessageMapping("/snapshot/resolve-conflict")
    public void handleConflictResolution(@Payload ConflictResolutionMessage message,
                                       @Header("simpSessionAttributes") Map<String, Object> sessionAttributes) {
        try {
            String tenantId = (String) sessionAttributes.get("tenantId");
            String deviceId = message.getDeviceId();
            
            // Handle null tenant ID
            if (tenantId == null) {
                log.error("Conflict resolution requested by device {} but tenant ID is null. Rejecting request.", deviceId);
                sendErrorToDevice(deviceId, "Tenant ID is required for conflict resolution");
                return;
            }
            
            log.info("Conflict resolution requested by device {} for tenant {}", deviceId, tenantId);
            
            // Process conflict resolution
            ConflictResolutionResult result = processConflictResolution(message);
            
            // Send resolution result
            messagingTemplate.convertAndSendToUser(deviceId, "/queue/conflict-resolution", result);
            
            // Notify other devices about conflict resolution
            notifyDevicesAboutConflictResolution(tenantId, deviceId, message.getEntityType(), message.getEntityId());
            
        } catch (Exception e) {
            log.error("Error handling conflict resolution", e);
            sendErrorToDevice(message.getDeviceId(), "Conflict resolution failed: " + e.getMessage());
        }
    }

    /**
     * Register device connection
     */
    private void registerDeviceConnection(String tenantId, String deviceId, String deviceName) {
        if (tenantId == null || deviceId == null) {
            log.error("Cannot register device connection: tenantId={}, deviceId={}", tenantId, deviceId);
            return;
        }
        
        tenantConnections.computeIfAbsent(tenantId, k -> new ConcurrentHashMap<>())
                .put(deviceId, new DeviceConnection(deviceId, deviceName, LocalDateTime.now()));
    }

    /**
     * Remove device connection
     */
    private void removeDeviceConnection(String tenantId, String deviceId) {
        if (tenantId == null || deviceId == null) {
            log.error("Cannot remove device connection: tenantId={}, deviceId={}", tenantId, deviceId);
            return;
        }
        
        Map<String, DeviceConnection> devices = tenantConnections.get(tenantId);
        if (devices != null) {
            devices.remove(deviceId);
        }
    }

    /**
     * Notify devices about new connection
     */
    private void notifyDevicesAboutConnection(String tenantId, String deviceId, String deviceName) {
        DeviceConnectionNotification notification = new DeviceConnectionNotification();
        notification.setType("device_connected");
        notification.setDeviceId(deviceId);
        notification.setDeviceName(deviceName);
        notification.setTimestamp(LocalDateTime.now());
        
        messagingTemplate.convertAndSend("/topic/tenant/" + tenantId + "/connections", notification);
    }

    /**
     * Notify devices about disconnection
     */
    private void notifyDevicesAboutDisconnection(String tenantId, String deviceId) {
        DeviceConnectionNotification notification = new DeviceConnectionNotification();
        notification.setType("device_disconnected");
        notification.setDeviceId(deviceId);
        notification.setTimestamp(LocalDateTime.now());
        
        messagingTemplate.convertAndSend("/topic/tenant/" + tenantId + "/connections", notification);
    }

    /**
     * Notify devices about data changes
     */
    private void notifyDevicesAboutDataChange(String tenantId, String deviceId, String changeType) {
        DataChangeNotification notification = new DataChangeNotification();
        notification.setType(changeType);
        notification.setSourceDeviceId(deviceId);
        notification.setTimestamp(LocalDateTime.now());
        notification.setMessage("Data has been updated");
        
        messagingTemplate.convertAndSend("/topic/tenant/" + tenantId + "/data-changes", notification);
    }

    /**
     * Notify devices about conflict resolution
     */
    private void notifyDevicesAboutConflictResolution(String tenantId, String deviceId, String entityType, String entityId) {
        ConflictResolutionNotification notification = new ConflictResolutionNotification();
        notification.setType("conflict_resolved");
        notification.setResolvedByDeviceId(deviceId);
        notification.setEntityType(entityType);
        notification.setEntityId(entityId);
        notification.setTimestamp(LocalDateTime.now());
        
        messagingTemplate.convertAndSend("/topic/tenant/" + tenantId + "/conflicts", notification);
    }

    /**
     * Send error to specific device
     */
    private void sendErrorToDevice(String deviceId, String errorMessage) {
        ErrorMessage error = new ErrorMessage();
        error.setDeviceId(deviceId);
        error.setMessage(errorMessage);
        error.setTimestamp(LocalDateTime.now());
        
        messagingTemplate.convertAndSendToUser(deviceId, "/queue/error", error);
    }

    /**
     * Process conflict resolution
     */
    private ConflictResolutionResult processConflictResolution(ConflictResolutionMessage message) {
        // TODO: Implement actual conflict resolution logic
        ConflictResolutionResult result = new ConflictResolutionResult();
        result.setDeviceId(message.getDeviceId());
        result.setEntityType(message.getEntityType());
        result.setEntityId(message.getEntityId());
        result.setResolution("accepted");
        result.setTimestamp(LocalDateTime.now());
        result.setMessage("Conflict resolved successfully");
        
        return result;
    }

    /**
     * Get connected devices for tenant
     */
    public Map<String, DeviceConnection> getConnectedDevices(String tenantId) {
        return tenantConnections.getOrDefault(tenantId, new ConcurrentHashMap<>());
    }
}
