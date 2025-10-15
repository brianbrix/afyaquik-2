package com.afyaquik.hms.billing.repository;

import com.afyaquik.hms.billing.domain.PaymentMethod;
import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends TenantAwareRepository<PaymentMethod, Long> {

    List<PaymentMethod> findByIsActiveTrueOrderBySortOrderAsc();

    @Query("SELECT pm FROM PaymentMethod pm WHERE pm.tenantId = :tenantId AND pm.isActive = true ORDER BY pm.sortOrder ASC")
    List<PaymentMethod> findActiveByTenantId(@Param("tenantId") String tenantId);

    boolean existsByCodeAndTenantId(String code, String tenantId);

    boolean existsByCodeAndTenantIdAndIdNot(String code, String tenantId, Long id);

    List<PaymentMethod> findByTenantId(String tenantId);

    Optional<PaymentMethod> findByIdAndTenantId(Long id, String tenantId);
    
    // Tenant-aware default methods
    default List<PaymentMethod> findActiveForCurrentTenant() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findActiveByTenantId(tenantId);
    }
    
    default boolean existsByCodeForCurrentTenant(String code) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return existsByCodeAndTenantId(code, tenantId);
    }
    
    default boolean existsByCodeForCurrentTenantExcludingId(String code, Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return existsByCodeAndTenantIdAndIdNot(code, tenantId, id);
    }
    
    default List<PaymentMethod> findAllForCurrentTenant() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantId(tenantId);
    }
    
    default Optional<PaymentMethod> findByIdForCurrentTenant(Long id) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByIdAndTenantId(id, tenantId);
    }
}
