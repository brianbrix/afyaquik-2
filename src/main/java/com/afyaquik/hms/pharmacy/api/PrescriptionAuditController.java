package com.afyaquik.hms.pharmacy.api;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.pharmacy.domain.PrescriptionAudit;
import com.afyaquik.hms.pharmacy.service.PrescriptionAuditService;

@RestController
@RequestMapping("/api/v1/pharmacy/prescription-audit")
public class PrescriptionAuditController {

    @Autowired
    private PrescriptionAuditService prescriptionAuditService;

    /**
     * Get audit trail for a specific prescription
     */
    @GetMapping("/prescription/{prescriptionId}")
    public ResponseEntity<ApiResponse<List<PrescriptionAudit>>> getPrescriptionAuditTrail(
            @PathVariable Long prescriptionId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        List<PrescriptionAudit> auditTrail = prescriptionAuditService.getAuditTrail(tenantId, prescriptionId);
        return ResponseEntity.ok(ApiResponse.success(auditTrail));
    }

    /**
     * Get audit entries by action type
     */
    @GetMapping("/action/{actionType}")
    public ResponseEntity<ApiResponse<List<PrescriptionAudit>>> getAuditByActionType(
            @PathVariable PrescriptionAudit.ActionType actionType) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        List<PrescriptionAudit> auditEntries = prescriptionAuditService.getAuditByActionType(tenantId, actionType);
        return ResponseEntity.ok(ApiResponse.success(auditEntries));
    }

    /**
     * Get audit entries for a specific user
     */
    @GetMapping("/user/{actionBy}")
    public ResponseEntity<ApiResponse<List<PrescriptionAudit>>> getAuditByUser(
            @PathVariable String actionBy) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        List<PrescriptionAudit> auditEntries = prescriptionAuditService.getAuditByUser(tenantId, actionBy);
        return ResponseEntity.ok(ApiResponse.success(auditEntries));
    }

    /**
     * Get latest audit entry for a prescription
     */
    @GetMapping("/prescription/{prescriptionId}/latest")
    public ResponseEntity<ApiResponse<PrescriptionAudit>> getLatestAuditEntry(
            @PathVariable Long prescriptionId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        PrescriptionAudit latestEntry = prescriptionAuditService.getLatestAuditEntry(tenantId, prescriptionId);
        return ResponseEntity.ok(ApiResponse.success(latestEntry));
    }

    /**
     * Get audit entries within a date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<PrescriptionAudit>>> getAuditByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            String tenantId = TenantHeaderInterceptor.getCurrentTenant();
            
            // Parse date strings to LocalDateTime with multiple format support
            LocalDateTime start = parseDateTime(startDate);
            LocalDateTime end = parseDateTime(endDate);
            
            List<PrescriptionAudit> auditEntries = prescriptionAuditService.getAuditByDateRange(tenantId, start, end);
            return ResponseEntity.ok(ApiResponse.success(auditEntries));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Invalid date format. Supported formats: yyyy-MM-ddTHH:mm:ss, yyyy-MM-dd, yyyy-MM-dd HH:mm:ss"));
        }
    }
    
    /**
     * Parse date string with multiple format support
     */
    private LocalDateTime parseDateTime(String dateString) {
        // Try different date formats
        String[] patterns = {
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd HH:mm:ss", 
            "yyyy-MM-dd'T'HH:mm",
            "yyyy-MM-dd HH:mm",
            "yyyy-MM-dd"
        };
        
        for (String pattern : patterns) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
                if (pattern.equals("yyyy-MM-dd")) {
                    // For date-only format, set time to start of day
                    return LocalDateTime.parse(dateString, formatter).withHour(0).withMinute(0).withSecond(0);
                }
                return LocalDateTime.parse(dateString, formatter);
            } catch (Exception e) {
                // Continue to next pattern
            }
        }
        
        throw new IllegalArgumentException("Unable to parse date: " + dateString);
    }
}
