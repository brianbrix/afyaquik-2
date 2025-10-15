package com.afyaquik.hms.inventory.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.inventory.domain.Supplier;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends TenantAwareRepository<Supplier, Long> {
    
    Optional<Supplier> findByTenantIdAndSupplierNameAndDeletedFalse(String tenantId, String supplierName);
    
    List<Supplier> findByTenantIdAndIsActiveTrueAndDeletedFalse(String tenantId);
    
    @Query("SELECT s FROM Supplier s WHERE s.tenantId = :tenantId AND s.supplierName LIKE %:searchTerm% AND s.deleted = false")
    List<Supplier> findBySupplierNameContaining(@Param("tenantId") String tenantId, @Param("searchTerm") String searchTerm);
    
    @Query("SELECT s FROM Supplier s WHERE s.tenantId = :tenantId AND s.email = :email AND s.deleted = false")
    Optional<Supplier> findByEmail(@Param("tenantId") String tenantId, @Param("email") String email);

    List<Supplier> findByTenantIdAndDeletedFalse(String tenantId);
}

