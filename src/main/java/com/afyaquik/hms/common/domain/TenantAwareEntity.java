package com.afyaquik.hms.common.domain;

/**
 * Interface that all tenant-aware entities should implement.
 * This ensures that all entities have a tenantId field for proper tenant isolation.
 */
public interface TenantAwareEntity {
    
    /**
     * Get the tenant ID for this entity.
     * @return the tenant ID
     */
    String getTenantId();
    
    /**
     * Set the tenant ID for this entity.
     * @param tenantId the tenant ID to set
     */
    void setTenantId(String tenantId);
}
