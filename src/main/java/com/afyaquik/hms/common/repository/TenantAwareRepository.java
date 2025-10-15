package com.afyaquik.hms.common.repository;

import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.List;
import java.util.Optional;

/**
 * Base repository interface that automatically applies tenant context to all queries.
 * All repositories should extend this interface to ensure tenant isolation.
 * 
 * This interface provides tenant-aware versions of common JPA repository methods
 * that automatically filter results by the current tenant context.
 */
@NoRepositoryBean
public interface TenantAwareRepository<T, ID> extends JpaRepository<T, ID>, JpaSpecificationExecutor<T> {
    
    /**
     * Find all entities for the current tenant.
     */
    default List<T> findAllForCurrentTenant() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findAllByTenantId(tenantId);
    }
    
    /**
     * Find all entities for a specific tenant.
     */
    List<T> findAllByTenantId(String tenantId);
    
    /**
     * Find entity by ID for the current tenant.
     */
    default Optional<T> findByIdForCurrentTenant(ID id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByIdAndTenantId(id, tenantId);
    }
    
    /**
     * Find entity by ID and tenant ID.
     */
    Optional<T> findByIdAndTenantId(ID id, String tenantId);
    
    /**
     * Check if entity exists by ID for the current tenant.
     */
    default boolean existsByIdForCurrentTenant(ID id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return existsByIdAndTenantId(id, tenantId);
    }
    
    /**
     * Check if entity exists by ID and tenant ID.
     */
    boolean existsByIdAndTenantId(ID id, String tenantId);
    
    /**
     * Count entities for the current tenant.
     */
    default long countForCurrentTenant() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return countByTenantId(tenantId);
    }
    
    /**
     * Count entities for a specific tenant.
     */
    long countByTenantId(String tenantId);
    
    /**
     * Delete entity by ID for the current tenant.
     */
    default void deleteByIdForCurrentTenant(ID id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        deleteByIdAndTenantId(id, tenantId);
    }
    
    /**
     * Delete entity by ID and tenant ID.
     */
    void deleteByIdAndTenantId(ID id, String tenantId);
    
    /**
     * Delete all entities for the current tenant.
     */
    default void deleteAllForCurrentTenant() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        deleteAllByTenantId(tenantId);
    }
    
    /**
     * Delete all entities for a specific tenant.
     */
    void deleteAllByTenantId(String tenantId);
}
