package com.afyaquik.hms.notification.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import com.afyaquik.hms.auth.service.PermissionService;

@Service
@Transactional(readOnly = true)
public class UserPermissionService {
    
    @Autowired
    private StaffUserRepository staffUserRepository;
    
    @Autowired
    private PermissionService permissionService;
    
    /**
     * Find all users with a specific permission
     */
    public List<String> findUsersWithPermission(String permissionCode) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        // Get all users in the tenant
        List<StaffUser> allUsers = staffUserRepository.findByTenantId(tenantId);
        
        // Filter users who have the specific permission
        return allUsers.stream()
                .filter(user -> hasPermission(user, permissionCode))
                .map(StaffUser::getUsername)
                .collect(Collectors.toList());
    }
    
    /**
     * Find all users with any of the specified permissions
     */
    public List<String> findUsersWithAnyPermission(String... permissionCodes) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        
        // Get all users in the tenant
        List<StaffUser> allUsers = staffUserRepository.findByTenantId(tenantId);
        
        // Filter users who have any of the specified permissions
        return allUsers.stream()
                .filter(user -> hasAnyPermission(user, permissionCodes))
                .map(StaffUser::getUsername)
                .collect(Collectors.toList());
    }
    
    /**
     * Check if a user has a specific permission
     */
    private boolean hasPermission(StaffUser user, String permissionCode) {
        try {
            // Use the permission service to check if user has the permission
            return permissionService.hasPermission(user.getUsername(), permissionCode);
        } catch (Exception e) {
            // If there's an error checking permissions, default to false
            return false;
        }
    }
    
    /**
     * Check if a user has any of the specified permissions
     */
    private boolean hasAnyPermission(StaffUser user, String... permissionCodes) {
        for (String permissionCode : permissionCodes) {
            if (hasPermission(user, permissionCode)) {
                return true;
            }
        }
        return false;
    }
}
