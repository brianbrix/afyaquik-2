package com.afyaquik.hms.audit.interceptor;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.afyaquik.hms.audit.domain.AuditLog;
import com.afyaquik.hms.audit.service.AuditLogService;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Interceptor to automatically create audit logs for user actions.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditInterceptor implements HandlerInterceptor {

    private final AuditLogService auditLogService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Store request start time for duration calculation
        request.setAttribute("auditStartTime", System.currentTimeMillis());
        request.setAttribute("auditRequestId", UUID.randomUUID().toString());
        
        // Debug logging
        log.debug("Audit interceptor preHandle called for: {} {}", request.getMethod(), request.getRequestURI());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        String username = "unknown";
        Long userId = null;
        
        try {
            // Skip audit logging for certain paths
            String requestPath = request.getRequestURI();
            log.debug("Audit interceptor afterCompletion called for: {} {}", request.getMethod(), requestPath);
            
            if (shouldSkipAudit(requestPath)) {
                log.debug("Skipping audit for path: {}", requestPath);
                return;
            }

            // For GET requests, only audit if accessing identifiable or confidential records
            if ("GET".equals(request.getMethod()) && !shouldAuditGetRequest(requestPath)) {
                log.debug("Skipping audit for GET request to non-sensitive path: {}", requestPath);
                return;
            }

            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return;
            }

            username = authentication.getName();
            userId = getUserId(authentication);
            
            // Skip audit logging if we can't determine the user ID
            if (userId == null) {
                log.debug("Skipping audit log creation - could not determine user ID for username: {}", username);
                return;
            }

            // Calculate duration
            Long startTime = (Long) request.getAttribute("auditStartTime");
            long duration = System.currentTimeMillis() - (startTime != null ? startTime : System.currentTimeMillis());

            // Create audit log
            AuditLog auditLog = new AuditLog();
            
            // Get tenant ID with fallback
            String tenantId = TenantHeaderInterceptor.getCurrentTenant();
            if (tenantId == null || tenantId.isEmpty()) {
                // Try to get tenant from request header as fallback
                tenantId = TenantHeaderInterceptor.getCurrentTenant();
                if (tenantId == null || tenantId.isEmpty()) {
                    // Use default tenant or skip audit log if no tenant available
                    log.warn("No tenant ID available for audit log, skipping audit for: {}", requestPath);
                    return;
                }
            }
            auditLog.setTenantId(tenantId);
            auditLog.setAction(determineAction(request));
            auditLog.setEntityType(determineEntityType(requestPath));
            auditLog.setUserId(userId);
            auditLog.setUsername(username);
            auditLog.setTimestamp(LocalDateTime.now());
            auditLog.setStatus(response.getStatus() >= 200 && response.getStatus() < 300 ? "SUCCESS" : "ERROR");
            auditLog.setDurationMs(duration);
            auditLog.setRequestId((String) request.getAttribute("auditRequestId"));
            auditLog.setEndpoint(requestPath);
            auditLog.setHttpMethod(request.getMethod());
            auditLog.setResponseStatus(response.getStatus());
            auditLog.setIpAddress(getClientIpAddress(request));
            auditLog.setUserAgent(request.getHeader("User-Agent"));
            
            // Safely get session ID - avoid session access after response is committed
            try {
                if (request.getSession(false) != null) {
                    auditLog.setSessionId(request.getSession(false).getId());
                }
            } catch (IllegalStateException e) {
                // Session is no longer available, skip session ID
                log.debug("Session not available for audit log: {}", e.getMessage());
            }
            
            // Add user type information for better audit trail
            String userType = getUserType(authentication);
            if (userType != null) {
                // Store user type in JSON format for frontend compatibility
                auditLog.setOldValues("{\"userType\":\"" + userType + "\"}");
            }

            if (ex != null) {
                auditLog.markAsError(ex.getMessage());
            }

            // Save audit log asynchronously to avoid performance impact
            auditLogService.saveAuditLogAsync(auditLog);
            
            log.debug("Audit log created for user {} (ID: {}) - Action: {} on {}", 
                username, userId, auditLog.getAction(), auditLog.getEndpoint());

        } catch (Exception e) {
            // Log error but don't fail the main request
            log.error("Failed to create audit log for user {} (ID: {})", username, userId, e);
        }
    }

    private boolean shouldSkipAudit(String requestPath) {
        // Skip audit logging for static resources, health checks, and certain API endpoints
        return requestPath.startsWith("/static/") ||
               requestPath.startsWith("/css/") ||
               requestPath.startsWith("/js/") ||
               requestPath.startsWith("/images/") ||
               requestPath.equals("/health") ||
               requestPath.equals("/actuator/health") ||
               requestPath.startsWith("/actuator/") ||
               requestPath.contains("/swagger") ||
               requestPath.contains("/api-docs");
    }

    /**
     * Determine if a GET request should be audited based on whether it accesses
     * identifiable or confidential records.
     */
    private boolean shouldAuditGetRequest(String requestPath) {
        // Audit GET requests that access identifiable or confidential data
        return requestPath.contains("/users/") ||           // Individual user records
               requestPath.contains("/patients/") ||        // Patient records
               requestPath.contains("/staff/") ||           // Staff records
               requestPath.contains("/appointments/") ||   // Appointment records
               requestPath.contains("/prescriptions/") ||   // Prescription records
               requestPath.contains("/bills/") ||           // Billing records
               requestPath.contains("/queue/") ||           // Queue/visit records
               requestPath.contains("/triage/") ||          // Triage records
               requestPath.contains("/consultation/") ||    // Consultation records
               requestPath.contains("/pharmacy/") ||        // Pharmacy records
               requestPath.contains("/inventory/") ||       // Inventory records
               requestPath.contains("/reports/") ||         // Reports
               requestPath.contains("/analytics/") ||       // Analytics data
               requestPath.contains("/audit-logs") ||       // Audit logs themselves
               requestPath.contains("/admin/") ||           // Admin operations
               requestPath.contains("/super-admin/") ||    // Super admin operations
               requestPath.contains("/profile") ||          // User profiles
               requestPath.contains("/settings") ||         // System settings
               requestPath.contains("/permissions") ||      // Permission data
               requestPath.contains("/roles") ||            // Role data
               requestPath.contains("/departments") ||      // Department data
               requestPath.contains("/shifts") ||           // Shift data
               requestPath.contains("/scheduling") ||       // Scheduling data
               requestPath.contains("/notifications") ||    // Notification data
               requestPath.contains("/uploads") ||          // File uploads
               requestPath.contains("/downloads") ||        // File downloads
               requestPath.contains("/export") ||           // Data exports
               requestPath.contains("/import") ||           // Data imports
               requestPath.contains("/backup") ||           // Backup operations
               requestPath.contains("/restore");            // Restore operations
    }

    private String determineAction(HttpServletRequest request) {
        String method = request.getMethod();
        String path = request.getRequestURI();
        
        if (path.contains("users")) {
            return switch (method) {
                case "POST" -> "CREATE_USER";
                case "PUT", "PATCH" -> "UPDATE_USER";
                case "DELETE" -> "DELETE_USER";
                case "GET" -> "VIEW_USER";
                default -> "UNKNOWN";
            };
        } 
        else if (path.contains("profile")) {
            return switch (method) {
                case "POST" -> "UPDATE_PROFILE";
                case "PUT", "PATCH" -> "UPDATE_PROFILE";
                case "DELETE" -> "DELETE_PROFILE";
                case "GET" -> "VIEW_PROFILE";
                default -> "UNKNOWN";
            };
        }
        else if (path.contains("department")) {
            return switch (method) {
                case "POST" -> "CREATE_DEPARTMENT";
                case "PUT", "PATCH" -> "UPDATE_DEPARTMENT";
                case "DELETE" -> "DELETE_DEPARTMENT";
                case "GET" -> "VIEW_DEPARTMENT";
                default -> "UNKNOWN";
            };
        }
        else if (path.contains("/shift")) {
            return switch (method) {
                case "POST" -> "CREATE_SHIFT";
                case "PUT", "PATCH" -> "UPDATE_SHIFT";
                case "DELETE" -> "DELETE_SHIFT";
                case "GET" -> "VIEW_SHIFT";
                default -> "UNKNOWN";
            };
        }
        else if (path.contains("shift-type")) {
            return switch (method) {
                case "POST" -> "CREATE_SHIFT_TYPE";
                case "PUT", "PATCH" -> "UPDATE_SHIFT_TYPE";
                case "DELETE" -> "DELETE_SHIFT_TYPE";
                case "GET" -> "VIEW_SHIFT_TYPE";
                default -> "UNKNOWN";
            };
        }
        else if (path.contains("appointment")) {
            return switch (method) {
                case "POST" -> "CREATE_APPOINTMENT";
                case "PUT", "PATCH" -> "UPDATE_APPOINTMENT";
                case "DELETE" -> "DELETE_APPOINTMENT";
                case "GET" -> "VIEW_APPOINTMENT";
                default -> "UNKNOWN";
            };
        }
        else if (path.contains("prescription")) {
            return switch (method) {
                case "POST" -> "CREATE_PRESCRIPTION";
                case "PUT", "PATCH" -> "UPDATE_PRESCRIPTION";
                case "DELETE" -> "DELETE_PRESCRIPTION";
                case "GET" -> "VIEW_PRESCRIPTION";
                default -> "UNKNOWN";
            };
        }
        else if (path.contains("bill")) {
            return switch (method) {
                case "POST" -> "CREATE_BILL";
                case "PUT", "PATCH" -> "UPDATE_BILL";
                case "DELETE" -> "DELETE_BILL";
                case "GET" -> "VIEW_BILL";
                default -> "UNKNOWN";
            };
        }
        else if (path.contains("insurance")) {
            return switch (method) {
                case "POST" -> "CREATE_INSURANCE";
                case "PUT", "PATCH" -> "UPDATE_INSURANCE";
                case "DELETE" -> "DELETE_INSURANCE";
                case "GET" -> "VIEW_INSURANCE";
                default -> "UNKNOWN";
            };
        }
        else if(path.contains("medication")) {
            return switch (method) {
                case "POST" -> "CREATE_MEDICATION";
                case "PUT", "PATCH" -> "UPDATE_MEDICATION";
                case "DELETE" -> "DELETE_MEDICATION";
                case "GET" -> "VIEW_MEDICATION";
                default -> "UNKNOWN";
            };
        }
        else if (path.contains("role")) {
            return switch (method) {
                case "POST" -> "CREATE_ROLE";
                case "PUT", "PATCH" -> "UPDATE_ROLE";
                case "DELETE" -> "DELETE_ROLE";
                case "GET" -> "VIEW_ROLE";
                default -> "UNKNOWN";
            };
        } else if (path.contains("tenant")) {
            return switch (method) {
                case "POST" -> "CREATE_TENANT";
                case "PUT", "PATCH" -> "UPDATE_TENANT";
                case "DELETE" -> "DELETE_TENANT";
                case "GET" -> "VIEW_TENANT";
                default -> "UNKNOWN";
            };
        } else if (path.contains("permission")) {
            return switch (method) {
                case "POST" -> "CREATE_PERMISSION";
                case "PUT", "PATCH" -> "UPDATE_PERMISSION";
                case "DELETE" -> "DELETE_PERMISSION";
                case "GET" -> "VIEW_PERMISSION";
                default -> "UNKNOWN";
            };
        }
        else if (path.contains("group")) {
            return switch (method) {
                case "POST" -> "CREATE_GROUP";
                case "PUT", "PATCH" -> "UPDATE_GROUP";
                case "DELETE" -> "DELETE_GROUP";
                case "GET" -> "VIEW_GROUP";
                default -> "UNKNOWN";
            };
        }
        else if(path.contains("settings")) {
            return switch (method) {
                case "POST" -> "CREATE_SETTING";
                case "PUT", "PATCH" -> "UPDATE_SETTING";
                case "DELETE" -> "DELETE_SETTING";
                case "GET" -> "VIEW_SETTING";
                default -> "UNKNOWN";
            };
        }
        else if(path.contains("redirects")) {
            return switch (method) {
                case "POST" -> "CREATE_REDIRECT";
                case "PUT", "PATCH" -> "UPDATE_REDIRECT";
                case "DELETE" -> "DELETE_REDIRECT";
                case "GET" -> "VIEW_REDIRECT";
                default -> "UNKNOWN";
            };
        }
        else if(path.contains("diagnostics")) {
            return switch (method) {
                case "POST" -> "CREATE_DIAGNOSTIC";
                case "PUT", "PATCH" -> "UPDATE_DIAGNOSTIC";
                case "DELETE" -> "DELETE_DIAGNOSTIC";
                case "GET" -> "VIEW_DIAGNOSTIC";
                default -> "UNKNOWN";
            };
        }
        else if (path.contains("/patients")) {
            return switch (method) {
                case "POST" -> "CREATE_PATIENT";
                case "PUT", "PATCH" -> "UPDATE_PATIENT";
                case "DELETE" -> "DELETE_PATIENT";
                case "GET" -> "VIEW_PATIENT";
                default -> "UNKNOWN";
            };
        } 
        
        else if (path.contains("/queue")) {
            return switch (method) {
                case "POST" -> "CREATE_QUEUE_ITEM";
                case "PUT", "PATCH" -> "UPDATE_QUEUE_ITEM";
                case "DELETE" -> "DELETE_QUEUE_ITEM";
                case "GET" -> "VIEW_QUEUE_ITEM";
                default -> "UNKNOWN";
            };
        }
        
        return method + "_" + path.replaceAll("[^a-zA-Z0-9]", "_").toUpperCase();
    }

    private String determineEntityType(String requestPath) {
        if (requestPath.contains("/users")) return "USER";
        if (requestPath.contains("/roles")) return "ROLE";
        if (requestPath.contains("/tenants")) return "TENANT";
        if (requestPath.contains("/patients")) return "PATIENT";
        if (requestPath.contains("/queue")) return "QUEUE_ITEM";
        if (requestPath.contains("/appointments")) return "APPOINTMENT";
        if (requestPath.contains("/prescriptions")) return "PRESCRIPTION";
        if (requestPath.contains("/bills")) return "BILL";
        if (requestPath.contains("/medication")) return "MEDICATION";
        if (requestPath.contains("/insurance")) return "INSURANCE";
        if (requestPath.contains("/inventory")) return "INVENTORY";
        if (requestPath.contains("/reports")) return "REPORT";
        if (requestPath.contains("/analytics")) return "ANALYTICS";
        if (requestPath.contains("/audit-logs")) return "AUDIT_LOG";
        if (requestPath.contains("/admin")) return "ADMIN";
        if (requestPath.contains("/super-admin")) return "SUPER_ADMIN";
        if (requestPath.contains("/profile")) return "PROFILE";
        if (requestPath.contains("/settings")) return "SETTINGS";
        if (requestPath.contains("/permissions")) return "PERMISSION";
        if (requestPath.contains("/group")) return "GROUP";
        if (requestPath.contains("/setting")) return "SETTING";
        if (requestPath.contains("/redirect")) return "REDIRECT";
        if (requestPath.contains("/diagnostic")) return "DIAGNOSTIC";
        return "UNKNOWN";
    }

    private Long getUserId(Authentication authentication) {
        try {
            Object principal = authentication.getPrincipal();
            
            // Handle TenantUserDetails (regular tenant users)
            if (principal instanceof com.afyaquik.hms.auth.security.TenantUserDetails tenantUserDetails) {
                return tenantUserDetails.getUser().getId();
            }
            
            // Handle SuperAdminUserDetails (super admin users)
            if (principal instanceof com.afyaquik.hms.auth.security.SuperAdminUserDetails superAdminUserDetails) {
                return superAdminUserDetails.getUser().getId();
            }
            
            // Fallback for other UserDetails implementations
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                // Try to extract from username if possible
                String username = authentication.getName();
                log.debug("Could not extract user ID from principal, using username: {}", username);
                return null; // Return null to indicate user ID could not be determined
            }
            
            log.warn("Unknown authentication principal type: {}", principal.getClass().getName());
            return null;
        } catch (Exception e) {
            log.error("Error extracting user ID from authentication", e);
            return null;
        }
    }

    private String getUserType(Authentication authentication) {
        try {
            Object principal = authentication.getPrincipal();
            
            if (principal instanceof com.afyaquik.hms.auth.security.TenantUserDetails) {
                return "TENANT_USER";
            }
            
            if (principal instanceof com.afyaquik.hms.auth.security.SuperAdminUserDetails) {
                return "SUPER_ADMIN";
            }
            
            return "UNKNOWN";
        } catch (Exception e) {
            log.error("Error determining user type", e);
            return "ERROR";
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
