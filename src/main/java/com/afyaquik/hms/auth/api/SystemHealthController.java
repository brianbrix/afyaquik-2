package com.afyaquik.hms.auth.api;

import com.afyaquik.hms.auth.service.SystemHealthService;
import com.afyaquik.hms.audit.annotation.NoAudit;
import com.afyaquik.hms.common.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/super-admin/system")
@RequiredArgsConstructor
@Slf4j
@NoAudit(reason = "System health monitoring endpoints")
public class SystemHealthController {

    private final SystemHealthService systemHealthService;

    /**
     * Get system health metrics
     */
    @GetMapping("/health")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<SystemHealthService.SystemHealthMetrics>> getSystemHealth() {
        try {
            SystemHealthService.SystemHealthMetrics health = systemHealthService.getSystemHealth();
            return ResponseEntity.ok(ApiResponse.success(health));
        } catch (Exception e) {
            log.error("Error fetching system health", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch system health: " + e.getMessage()));
        }
    }

    /**
     * Get system performance metrics
     */
    @GetMapping("/performance")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<SystemHealthService.SystemPerformanceMetrics>> getSystemPerformance() {
        try {
            SystemHealthService.SystemPerformanceMetrics performance = systemHealthService.getSystemPerformance();
            return ResponseEntity.ok(ApiResponse.success(performance));
        } catch (Exception e) {
            log.error("Error fetching system performance", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch system performance: " + e.getMessage()));
        }
    }

    /**
     * Get database statistics
     */
    @GetMapping("/database")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<SystemHealthService.DatabaseStats>> getDatabaseStats() {
        try {
            SystemHealthService.DatabaseStats stats = systemHealthService.getDatabaseStats();
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            log.error("Error fetching database stats", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch database stats: " + e.getMessage()));
        }
    }
}
