package com.afyaquik.hms.audit.interceptor;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import com.afyaquik.hms.audit.annotation.Auditable;
import com.afyaquik.hms.audit.annotation.NoAudit;
import com.afyaquik.hms.audit.domain.AuditLog;
import com.afyaquik.hms.audit.service.AuditLogService;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Annotation-based audit interceptor that uses @Auditable and @NoAudit annotations
 * to determine what should be audited.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AnnotationBasedAuditInterceptor implements HandlerInterceptor {

    private final AuditLogService auditLogService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Store request start time for duration calculation
        request.setAttribute("auditStartTime", System.currentTimeMillis());
        request.setAttribute("auditRequestId", UUID.randomUUID().toString());
        
        log.info("Annotation-based audit interceptor preHandle called for: {} {}", 
                 request.getMethod(), request.getRequestURI());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        try {
            // Check if handler is a method handler
            if (!(handler instanceof HandlerMethod)) {
                log.info("Skipping audit - handler is not a method handler");
                return;
            }
            
            HandlerMethod handlerMethod = (HandlerMethod) handler;
            Method method = handlerMethod.getMethod();
            Class<?> controllerClass = handlerMethod.getBeanType();
            
            // Check for @NoAudit annotation on method or class
            NoAudit noAuditMethod = AnnotationUtils.findAnnotation(method, NoAudit.class);
            NoAudit noAuditClass = AnnotationUtils.findAnnotation(controllerClass, NoAudit.class);
            
            if (noAuditMethod != null || noAuditClass != null) {
                log.info("Skipping audit - @NoAudit annotation found on method or class");
                return;
            }
            
            // Check for @Auditable annotation on method or class
            Auditable auditableMethod = AnnotationUtils.findAnnotation(method, Auditable.class);
            Auditable auditableClass = AnnotationUtils.findAnnotation(controllerClass, Auditable.class);
            
            if (auditableMethod == null && auditableClass == null) {
                log.info("Skipping audit - no @Auditable annotation found");
                return;
            }
            
            // Use method annotation if available, otherwise use class annotation
            Auditable auditable = auditableMethod != null ? auditableMethod : auditableClass;
            
            // For GET requests, check if auditing is enabled
            if ("GET".equals(request.getMethod()) && !auditable.auditGet()) {
                log.info("Skipping audit for GET request - auditGet is false");
                return;
            }
            
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                log.info("Skipping audit - no authenticated user");
                return;
            }
            
            String username = authentication.getName();
            Long userId = getUserId(authentication);
            
            if (userId == null) {
                log.info("Skipping audit - could not determine user ID for username: {}", username);
                return;
            }
            
            // Calculate duration
            Long startTime = (Long) request.getAttribute("auditStartTime");
            long duration = System.currentTimeMillis() - (startTime != null ? startTime : System.currentTimeMillis());
            
            // Create audit log
            AuditLog auditLog = new AuditLog();
            
            // Get tenant ID - handle super admin and regular users differently
            String tenantId = TenantHeaderInterceptor.getCurrentTenant();
            log.info("Tenant ID from ThreadLocal: {}", tenantId);
            
            // Check if this is a super admin request
            boolean isSuperAdminRequest = request.getRequestURI().startsWith("/api/v1/super-admin/");
            
            if (tenantId == null || tenantId.trim().isEmpty()) {
                if (isSuperAdminRequest) {
                    // For super admin requests, use "super-admin" as tenant ID
                    tenantId = "super-admin";
                    log.info("Super admin request detected, using tenant ID: {}", tenantId);
                } else {
                    // Fallback: get tenant ID directly from request header
                    tenantId = request.getHeader("X-Tenant-Id");
                    log.info("Tenant ID from request header: {}", tenantId);
                    
                    if (tenantId == null || tenantId.trim().isEmpty()) {
                        log.warn("No tenant ID found for audit log, using default");
                        tenantId = "default";
                    } else {
                        tenantId = tenantId.trim();
                    }
                }
            }
            
            log.info("Final tenant ID for audit log: {}", tenantId);
            
            // Handle session ID for stateless applications
            try {
                // Try to get existing session first
                if (request.getSession(false) != null) {
                    auditLog.setSessionId(request.getSession(false).getId());
                    log.debug("Session ID found: {}", request.getSession(false).getId());
                } else {
                    // For stateless applications (JWT-based), use request ID as session identifier
                    String requestId = (String) request.getAttribute("auditRequestId");
                    if (requestId != null) {
                        auditLog.setSessionId("REQ-" + requestId);
                        log.debug("Using request ID as session identifier: {}", requestId);
                    } else {
                        // Fallback: use a combination of user ID and timestamp
                        auditLog.setSessionId("USER-" + userId + "-" + System.currentTimeMillis());
                        log.debug("Using user-based session identifier for user: {}", userId);
                    }
                }
            } catch (IllegalStateException e) {
                log.info("Session not available for audit log: {}", e.getMessage());
                // Fallback for stateless applications
                String requestId = (String) request.getAttribute("auditRequestId");
                if (requestId != null) {
                    auditLog.setSessionId("REQ-" + requestId);
                } else {
                    auditLog.setSessionId("USER-" + userId + "-" + System.currentTimeMillis());
                }
            }
            
            // Add user type information
            String userType = getUserType(authentication);
            if (userType != null) {
                auditLog.setOldValues("{\"userType\":\"" + userType + "\"}");
            }
            
            // Set basic audit log information
            auditLog.setUsername(username);
            auditLog.setUserId(userId);
            auditLog.setTenantId(tenantId);
            auditLog.setTimestamp(LocalDateTime.now());
            auditLog.setDuration(duration);
            auditLog.setRequestId((String) request.getAttribute("auditRequestId"));
            auditLog.setEndpoint(request.getRequestURI());
            auditLog.setHttpMethod(request.getMethod());
            auditLog.setResponseStatus(response.getStatus());
            auditLog.setIpAddress(getClientIpAddress(request));
            auditLog.setUserAgent(request.getHeader("User-Agent"));
            
            // Set status based on response and exceptions
            if (ex != null) {
                auditLog.markAsError(ex.getMessage());
            } else {
                // Set status based on HTTP response status
                int statusCode = response.getStatus();
                if (statusCode >= 200 && statusCode < 300) {
                    auditLog.setStatus("SUCCESS");
                } else if (statusCode >= 400 && statusCode < 500) {
                    auditLog.setStatus("CLIENT_ERROR");
                } else if (statusCode >= 500) {
                    auditLog.setStatus("SERVER_ERROR");
                } else {
                    auditLog.setStatus("UNKNOWN");
                }
            }
            
            // Use annotation values for action and entity
            String action = auditable.action().isEmpty() ? determineAction(request) : auditable.action();
            String entityType = auditable.entityType().isEmpty() ? determineEntityType(request.getRequestURI()) : auditable.entityType();
            Long entityId = extractEntityId(request.getRequestURI());
            
            auditLog.setAction(action);
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            
            // Save audit log
            auditLogService.saveAuditLogAsync(auditLog);
            log.info("Audit log created for {} {} by {} with action: {}", 
                     request.getMethod(), request.getRequestURI(), username, action);
            
        } catch (Exception e) {
            log.error("Failed to create audit log for {} {}: {}", 
                     request.getMethod(), request.getRequestURI(), e.getMessage(), e);
        }
    }
    
    /**
     * Extract user ID from authentication
     */
    private Long getUserId(Authentication authentication) {
        try {
            Object principal = authentication.getPrincipal();
            
            // Handle TenantUserDetails (regular tenant users)
            if (principal instanceof com.afyaquik.hms.auth.security.TenantUserDetails) {
                com.afyaquik.hms.auth.security.TenantUserDetails tenantUserDetails = 
                    (com.afyaquik.hms.auth.security.TenantUserDetails) principal;
                return tenantUserDetails.getUser().getId();
            }
            
            // Handle SuperAdminUserDetails (super admin users)
            if (principal instanceof com.afyaquik.hms.auth.security.SuperAdminUserDetails) {
                com.afyaquik.hms.auth.security.SuperAdminUserDetails superAdminUserDetails = 
                    (com.afyaquik.hms.auth.security.SuperAdminUserDetails) principal;
                return superAdminUserDetails.getUser().getId();
            }
            
            // Handle generic UserDetails (fallback)
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                // For generic UserDetails, we can't extract ID directly
                // This might happen with anonymous users or other authentication mechanisms
                log.info("Generic UserDetails found, cannot extract user ID");
                return null;
            }
            
            log.info("Unknown principal type: {}", principal.getClass().getName());
            return null;
            
        } catch (Exception e) {
            log.info("Could not extract user ID from authentication: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Get user type from authentication
     */
    private String getUserType(Authentication authentication) {
        try {
            Object principal = authentication.getPrincipal();
            
            // Handle TenantUserDetails (regular tenant users)
            if (principal instanceof com.afyaquik.hms.auth.security.TenantUserDetails) {
                return "TENANT_USER";
            }
            
            // Handle SuperAdminUserDetails (super admin users)
            if (principal instanceof com.afyaquik.hms.auth.security.SuperAdminUserDetails) {
                return "SUPER_ADMIN";
            }
            
            // Handle generic UserDetails (fallback)
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                return "UNKNOWN_USER";
            }
            
            return "UNKNOWN_USER";
            
        } catch (Exception e) {
            log.info("Could not extract user type from authentication: {}", e.getMessage());
            return "UNKNOWN_USER";
        }
    }
    
    /**
     * Get client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
    
    /**
     * Determine action from request method and path
     */
    private String determineAction(HttpServletRequest request) {
        String method = request.getMethod();
        String path = request.getRequestURI();
        
        if (path.contains("users")) {
            return switch (method) {
                case "POST" -> "CREATE_USER";
                case "PUT", "PATCH" -> "UPDATE_USER";
                case "DELETE" -> "DELETE_USER";
                case "GET" -> "VIEW_USER";
                default -> method + "_USER";
            };
        } else if (path.contains("patients")) {
            return switch (method) {
                case "POST" -> "CREATE_PATIENT";
                case "PUT", "PATCH" -> "UPDATE_PATIENT";
                case "DELETE" -> "DELETE_PATIENT";
                case "GET" -> "VIEW_PATIENT";
                default -> method + "_PATIENT";
            };
        } else if (path.contains("queue")) {
            return switch (method) {
                case "POST" -> "CREATE_QUEUE_ITEM";
                case "PUT", "PATCH" -> "UPDATE_QUEUE_ITEM";
                case "DELETE" -> "DELETE_QUEUE_ITEM";
                case "GET" -> "VIEW_QUEUE_ITEM";
                default -> method + "_QUEUE_ITEM";
            };
        }
        
        return method + "_" + path.split("/")[path.split("/").length - 1].toUpperCase();
    }
    
    /**
     * Determine entity type from request path
     */
    private String determineEntityType(String requestPath) {
        if (requestPath.contains("/users")) return "User";
        if (requestPath.contains("/patients")) return "Patient";
        if (requestPath.contains("/queue")) return "Queue";
        if (requestPath.contains("/billing")) return "Bill";
        if (requestPath.contains("/pharmacy")) return "Medication";
        if (requestPath.contains("/consultation")) return "ConsultationEntry";
        if (requestPath.contains("/triage")) return "TriageEntry";
        if (requestPath.contains("/appointments")) return "Appointment";
        if (requestPath.contains("/prescriptions")) return "Prescription";
        if (requestPath.contains("/inventory")) return "Inventory";
        if (requestPath.contains("/diagnostics")) return "DiagnosticOrder";
        if (requestPath.contains("/scheduling")) return "Shift";
        if (requestPath.contains("/admin")) return "Admin";
        if (requestPath.contains("/auth")) return "Auth";
        if (requestPath.contains("/profile")) return "UserProfile";
        if (requestPath.contains("/reports")) return "Report";
        if (requestPath.contains("/analytics")) return "Analytics";
        if (requestPath.contains("/audit")) return "AuditLog";
        if (requestPath.contains("/notification")) return "Notification";
        if (requestPath.contains("/settings")) return "Settings";
        if (requestPath.contains("/config")) return "Config";
        if (requestPath.contains("/reference")) return "Reference";
        if (requestPath.contains("/insurance")) return "Insurance";
        if (requestPath.contains("/team")) return "Team";
        if (requestPath.contains("/dashboard")) return "Dashboard";
        if (requestPath.contains("/storage")) return "FileUpload";
        if (requestPath.contains("/directory")) return "StaffDirectory";
        if (requestPath.contains("/superadmin")) return "SuperAdmin";
        if (requestPath.contains("/websocket")) return "WebSocket";
        
        return "Unknown";
    }
    
    /**
     * Extract entity ID from request path
     */
    private Long extractEntityId(String requestPath) {
        try {
            String[] pathParts = requestPath.split("/");
            for (int i = 0; i < pathParts.length - 1; i++) {
                if (pathParts[i].matches("\\d+")) {
                    return Long.parseLong(pathParts[i]);
                }
            }
        } catch (NumberFormatException e) {
            log.info("Could not parse entity ID from path: {}", requestPath);
        }
        return null;
    }
}
