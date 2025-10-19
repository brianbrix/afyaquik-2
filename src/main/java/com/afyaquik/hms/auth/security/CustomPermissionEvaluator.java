package com.afyaquik.hms.auth.security;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.afyaquik.hms.auth.service.PermissionService;

/**
 * Custom permission evaluator that integrates with our resolved permissions system.
 * This allows @PreAuthorize("hasPermission('PERMISSION_NAME')") to work with our
 * User > Group > Role permission hierarchy.
 */
@Component
public class CustomPermissionEvaluator implements PermissionEvaluator {

    @Autowired
    private PermissionService permissionService;
    
    @Autowired
    private com.afyaquik.hms.auth.repository.StaffUserRepository staffUserRepository;

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String username = authentication.getName();
        String permissionName = permission.toString();
        
        try {
            // Check if this is a super admin user
            if (authentication.getPrincipal() instanceof SuperAdminUserDetails) {
                // Super admin users have all permissions
                return true;
            }
            
            // Special case for supervisor check - handle this independently
            if ("isSupervisor".equals(permissionName)) {
                return checkIsSupervisor(username);
            }
            
            // For other permissions, try to get resolved permissions
            try {
                Map<String, String> resolvedPermissions = permissionService.getResolvedPermissions(username);
                String permissionValue = resolvedPermissions.get(permissionName);
                return "ALLOWED".equals(permissionValue);
            } catch (Exception permException) {
                System.err.println("Error getting resolved permissions for user '" + username + "': " + permException.getMessage());
                // Fall back to false for security
                return false;
            }
        } catch (Exception e) {
            // Log the error and return false for security
            System.err.println("Error evaluating permission '" + permissionName + "' for user '" + username + "': " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    private boolean checkIsSupervisor(String username) {
        try {
            // Use tenant-aware lookup to avoid duplicate username issues
            String tenantId = com.afyaquik.hms.common.web.TenantHeaderInterceptor.getCurrentTenant();
            if (tenantId == null) {
                System.err.println("No tenant context available for supervisor check");
                return false;
            }
            
            com.afyaquik.hms.auth.domain.StaffUser user = 
                staffUserRepository.findByTenantIdAndUsernameAndDeletedFalse(tenantId, username);
            if (user == null) {
                System.err.println("User not found for supervisor check: " + username);
                return false;
            }
            
            // Check if this user has any supervised users
            List<com.afyaquik.hms.auth.domain.StaffUser> supervisedUsers = 
                staffUserRepository.findBySupervisorIdAndDeletedFalse(user.getId());
            
            boolean isSupervisor = !supervisedUsers.isEmpty();
            System.out.println("Supervisor check for " + username + ": " + isSupervisor + " (supervised users: " + supervisedUsers.size() + ")");
            return isSupervisor;
        } catch (Exception e) {
            System.err.println("Error checking supervisor status for " + username + ": " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        // For this implementation, we don't need target-specific permissions
        // Just delegate to the main hasPermission method
        return hasPermission(authentication, null, permission);
    }
}
