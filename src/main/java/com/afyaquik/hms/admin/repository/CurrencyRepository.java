package com.afyaquik.hms.admin.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.admin.domain.Currency;

/**
 * Repository for Currency entity.
 */
@Repository
public interface CurrencyRepository extends JpaRepository<Currency, Long> {

    /**
     * Find all active currencies for a tenant.
     */
    @Query("SELECT c FROM Currency c WHERE c.tenantId = :tenantId AND c.isActive = true AND c.deleted = false ORDER BY c.isDefault DESC, c.name ASC")
    List<Currency> findByTenantIdAndActiveOrderByDefaultAndName(@Param("tenantId") String tenantId);

    /**
     * Find the default currency for a tenant.
     */
    @Query("SELECT c FROM Currency c WHERE c.tenantId = :tenantId AND c.isDefault = true AND c.isActive = true AND c.deleted = false")
    Optional<Currency> findDefaultByTenantId(@Param("tenantId") String tenantId);

    /**
     * Find currency by code for a tenant.
     */
    @Query("SELECT c FROM Currency c WHERE c.tenantId = :tenantId AND c.code = :code AND c.deleted = false")
    Optional<Currency> findByTenantIdAndCode(@Param("tenantId") String tenantId, @Param("code") String code);

    /**
     * Check if currency code exists for a tenant (excluding current currency).
     */
    @Query("SELECT COUNT(c) > 0 FROM Currency c WHERE c.tenantId = :tenantId AND c.code = :code AND c.deleted = false AND (:excludeId IS NULL OR c.id != :excludeId)")
    boolean existsByTenantIdAndCodeAndIdNot(@Param("tenantId") String tenantId, @Param("code") String code, @Param("excludeId") Long excludeId);

    /**
     * Find all currencies for a tenant (including inactive).
     */
    @Query("SELECT c FROM Currency c WHERE c.tenantId = :tenantId AND c.deleted = false ORDER BY c.isDefault DESC, c.name ASC")
    List<Currency> findByTenantIdOrderByDefaultAndName(@Param("tenantId") String tenantId);
}

