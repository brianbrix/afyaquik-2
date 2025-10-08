package com.afyaquik.hms.auth.service;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class ActiveRoleService {

    private final Map<String, String> activeRoleByUser = new ConcurrentHashMap<>();

    public void setActiveRole(String tenantId, String userId, String role) {
        activeRoleByUser.put(key(tenantId, userId), role);
    }

    public Optional<String> getActiveRole(String tenantId, String userId) {
        return Optional.ofNullable(activeRoleByUser.get(key(tenantId, userId)));
    }

    public void clear() {
        activeRoleByUser.clear();
    }

    private String key(String tenantId, String userId) {
        return tenantId + "::" + userId;
    }
}
