package com.afyaquik.hms.auth.service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ActiveRoleService {

    private static final Logger log = LoggerFactory.getLogger(ActiveRoleService.class);

    private final Map<String, String> activeRoleByUser = new ConcurrentHashMap<>();

    public void setActiveRole(String tenantId, String userId, String role) {
        activeRoleByUser.put(key(tenantId, userId), role);
        log.info("Set active role for tenant={} userId={} role={}", tenantId, userId, role);
    }

    public Optional<String> getActiveRole(String tenantId, String userId) {
        String value = activeRoleByUser.get(key(tenantId, userId));
        log.debug("Get active role for tenant={} userId={} -> {}", tenantId, userId, value);
        return Optional.ofNullable(value);
    }

    public void clear() {
        activeRoleByUser.clear();
        log.info("Cleared all active roles");
    }

    private String key(String tenantId, String userId) {
        return tenantId + "::" + userId;
    }
}
