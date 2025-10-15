package com.afyaquik.hms.auth.service;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SupervisorService {

    @Autowired
    private StaffUserRepository staffUserRepository;

    public Map<String, Object> getSupervisorStatus(String username) {
        Map<String, Object> status = new HashMap<>();
        
        // Find the user with tenant context
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        StaffUser user = staffUserRepository.findByTenantIdAndUsernameAndDeletedFalse(tenantId, username);
        if (user == null) {
            status.put("isSupervisor", false);
            status.put("supervisedUsersCount", 0);
            return status;
        }

        // Count users who have this user as their supervisor
        List<StaffUser> supervisedUsers = staffUserRepository.findBySupervisorIdAndDeletedFalse(user.getId());
        
        boolean isSupervisor = !supervisedUsers.isEmpty();
        status.put("isSupervisor", isSupervisor);
        status.put("supervisedUsersCount", supervisedUsers.size());
        
        return status;
    }
}
