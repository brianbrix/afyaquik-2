package com.afyaquik.hms.team.controller;

import com.afyaquik.hms.auth.service.PermissionService;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Test controller to debug supervisor permission issues.
 */
@RestController
@RequestMapping("/api/v1/test")
public class TestSupervisorController {

    private final PermissionService permissionService;
    
    private final StaffUserRepository staffUserRepository;

    public TestSupervisorController(PermissionService permissionService, StaffUserRepository staffUserRepository) {
        this.permissionService = permissionService;
        this.staffUserRepository = staffUserRepository;
    }

    @GetMapping("/supervisor-check")
    public ApiResponse<Map<String, Object>> testSupervisorCheck(Authentication authentication) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            String username = authentication.getName();
            String tenantId = TenantHeaderInterceptor.getCurrentTenant();
            
            result.put("username", username);
            result.put("tenantId", tenantId);
            result.put("authenticated", authentication.isAuthenticated());
            
            // Test user lookup
            try {
                var user = staffUserRepository.findByTenantIdAndUsernameAndDeletedFalse(tenantId, username);
                result.put("userFound", user != null);
                if (user != null) {
                    result.put("userId", user.getId());
                    result.put("userDisplayName", user.getDisplayName());
                    
                    // Test supervisor check
                    List<com.afyaquik.hms.auth.domain.StaffUser> supervisedUsers = staffUserRepository.findBySupervisorIdAndDeletedFalse(user.getId());
                    result.put("supervisedUsersCount", supervisedUsers.size());
                    result.put("isSupervisor", !supervisedUsers.isEmpty());
                }
            } catch (Exception e) {
                result.put("userLookupError", e.getMessage());
            }
            
            // Test permission resolution
            try {
                Map<String, String> permissions = permissionService.getResolvedPermissions(username);
                result.put("permissionsCount", permissions.size());
                result.put("permissions", permissions);
            } catch (Exception e) {
                result.put("permissionError", e.getMessage());
            }
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
            e.printStackTrace();
        }
        
        return ApiResponse.success(result);
    }
}
