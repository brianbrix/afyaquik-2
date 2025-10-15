package com.afyaquik.hms.billing.repository;

import com.afyaquik.hms.billing.domain.Discount;
import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscountRepository extends TenantAwareRepository<Discount, Long> {
    List<Discount> findByBillIdAndDeletedFalse(Long billId);
    List<Discount> findByBillTenantIdAndDeletedFalse(String tenantId);
    
    // Tenant-aware default methods
    default List<Discount> findByBillIdForCurrentTenant(Long billId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByBillIdAndDeletedFalse(billId);
    }
    
    default List<Discount> findAllForCurrentTenant() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByBillTenantIdAndDeletedFalse(tenantId);
    }
}
