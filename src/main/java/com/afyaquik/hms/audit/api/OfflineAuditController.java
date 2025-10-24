package com.afyaquik.hms.audit.api;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.audit.dto.OfflineAuditSyncRequest;
import com.afyaquik.hms.audit.service.OfflineAuditService;

/**
 * Controller for offline audit trail synchronization
 */
@RestController
@RequestMapping("/api/v1/audit")
public class OfflineAuditController {
    
    @Autowired
    private OfflineAuditService offlineAuditService;
    
    /**
     * Sync offline audit entries to server
     */
    @PostMapping("/offline")
    public ResponseEntity<Map<String, Object>> syncOfflineAuditEntries(
            @RequestBody OfflineAuditSyncRequest request) {
        
        try {
            Map<String, Object> result = offlineAuditService.syncOfflineEntries(request.getEntries());
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get offline audit statistics
     */
    @GetMapping("/offline/statistics")
    public ResponseEntity<Map<String, Object>> getOfflineAuditStatistics() {
        try {
            Map<String, Object> statistics = offlineAuditService.getOfflineAuditStatistics();
            return ResponseEntity.ok(statistics);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get offline audit entries for a user
     */
    @GetMapping("/offline/user/{userId}")
    public ResponseEntity<Map<String, Object>> getOfflineAuditEntriesByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        try {
            Map<String, Object> result = offlineAuditService.getOfflineAuditEntriesByUser(userId, page, size);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get offline audit entries by date range
     */
    @GetMapping("/offline/date-range")
    public ResponseEntity<Map<String, Object>> getOfflineAuditEntriesByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        try {
            Map<String, Object> result = offlineAuditService.getOfflineAuditEntriesByDateRange(
                startDate, endDate, page, size);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Export offline audit entries
     */
    @GetMapping("/offline/export")
    public ResponseEntity<Map<String, Object>> exportOfflineAuditEntries(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "json") String format) {
        
        try {
            Map<String, Object> result = offlineAuditService.exportOfflineAuditEntries(
                startDate, endDate, userId, format);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
