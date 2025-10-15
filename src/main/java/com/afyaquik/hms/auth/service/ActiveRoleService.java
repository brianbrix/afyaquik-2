package com.afyaquik.hms.auth.service;

import com.afyaquik.hms.auth.domain.ActiveRole;
import com.afyaquik.hms.auth.repository.ActiveRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

@Service
@Transactional
public class ActiveRoleService {

    private static final Logger log = LoggerFactory.getLogger(ActiveRoleService.class);

    @Autowired
    private ActiveRoleRepository activeRoleRepository;

    public void setActiveRole(String tenantId, String userId, String roleKey, String roleName, String roleDescription) {
        log.info("Setting active role for tenant={} userId={} roleKey={}", tenantId, userId, roleKey);
        
        // Find existing active role
        Optional<ActiveRole> existingRole = activeRoleRepository.findByTenantIdAndUserIdAndDeletedFalse(tenantId, Long.parseLong(userId));
        
        if (existingRole.isPresent()) {
            // Update existing role
            ActiveRole activeRole = existingRole.get();
            activeRole.setRoleKey(roleKey);
            activeRole.setRoleName(roleName);
            activeRole.setRoleDescription(roleDescription);
            activeRoleRepository.save(activeRole);
            log.info("Updated active role for tenant={} userId={} to roleKey={}", tenantId, userId, roleKey);
        } else {
            // Create new active role
            ActiveRole newActiveRole = new ActiveRole(tenantId, Long.parseLong(userId), roleKey, roleName, roleDescription);
            activeRoleRepository.save(newActiveRole);
            log.info("Created new active role for tenant={} userId={} roleKey={}", tenantId, userId, roleKey);
        }
    }

    public Optional<String> getActiveRole(String tenantId, String userId) {
        log.info("Getting active role for tenant={} userId={}", tenantId, userId);
        
        Optional<ActiveRole> activeRole = activeRoleRepository.findByTenantIdAndUserIdAndDeletedFalse(tenantId, Long.parseLong(userId));
        
        if (activeRole.isPresent()) {
            String roleKey = activeRole.get().getRoleKey();
            log.info("Found active role for tenant={} userId={} -> {}", tenantId, userId, roleKey);
            return Optional.of(roleKey);
        } else {
            log.warn("No active role found for tenant={} userId={}", tenantId, userId);
            return Optional.empty();
        }
    }

    public void clearActiveRole(String tenantId, String userId) {
        log.info("Clearing active role for tenant={} userId={}", tenantId, userId);
        activeRoleRepository.deleteByTenantIdAndUserId(tenantId, Long.parseLong(userId));
    }

    public void clear() {
        log.info("Clearing all active roles");
        // Note: This would need a custom implementation to clear all active roles
        // For now, we'll leave this as a placeholder
    }
}
