package com.afyaquik.hms.auth.repository;

import com.afyaquik.hms.auth.domain.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    
    Optional<Tenant> findByTenantCode(String tenantCode);
    
    boolean existsByTenantCode(String tenantCode);
    
    List<Tenant> findByIsActiveTrue();
    
    List<Tenant> findByIsActiveFalse();
    
    @Query("SELECT t FROM Tenant t WHERE t.isActive = true ORDER BY t.tenantName ASC")
    List<Tenant> findActiveTenantsOrderByName();
    
    @Query("SELECT t FROM Tenant t WHERE t.trialEndsAt IS NOT NULL AND t.trialEndsAt < CURRENT_TIMESTAMP")
    List<Tenant> findExpiredTrials();
    
    @Query("SELECT t FROM Tenant t WHERE t.subscriptionPlan = :plan")
    List<Tenant> findBySubscriptionPlan(@Param("plan") String plan);
    
    @Query("SELECT COUNT(t) FROM Tenant t WHERE t.isActive = true")
    Long countActiveTenants();
}
