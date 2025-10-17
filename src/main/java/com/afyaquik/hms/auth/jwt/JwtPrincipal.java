package com.afyaquik.hms.auth.jwt;

import java.util.List;

public record JwtPrincipal(Long userId, String username, String tenantId, List<String> roles) {
    
    /**
     * Check if this is a Super Admin token
     */
    public boolean isSuperAdmin() {
        return roles != null && roles.contains("SUPER_ADMIN");
    }
}
