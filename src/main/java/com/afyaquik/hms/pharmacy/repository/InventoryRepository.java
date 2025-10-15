package com.afyaquik.hms.pharmacy.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afyaquik.hms.pharmacy.domain.Inventory;
import com.afyaquik.hms.pharmacy.domain.Medication;

@Repository
public interface InventoryRepository extends TenantAwareRepository<Inventory, Long> {

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND i.deleted = false AND i.active = true")
    List<Inventory> findByTenantIdAndNotDeleted(@Param("tenantId") String tenantId);

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND i.deleted = false AND i.active = true")
    Page<Inventory> findByTenantIdAndNotDeleted(@Param("tenantId") String tenantId, Pageable pageable);

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND i.medication = :medication AND i.deleted = false")
    Optional<Inventory> findByTenantIdAndMedication(@Param("tenantId") String tenantId, @Param("medication") Medication medication);

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND i.medication.id = :medicationId AND i.deleted = false")
    Optional<Inventory> findByTenantIdAndMedicationId(@Param("tenantId") String tenantId, @Param("medicationId") Long medicationId);

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND i.quantityInStock <= i.minimumStockLevel AND i.deleted = false AND i.active = true")
    List<Inventory> findLowStockByTenantId(@Param("tenantId") String tenantId);

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND i.quantityInStock <= i.minimumStockLevel AND i.deleted = false AND i.active = true")
    Page<Inventory> findLowStockByTenantId(@Param("tenantId") String tenantId, Pageable pageable);

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND i.reorderPoint IS NOT NULL AND i.quantityInStock <= i.reorderPoint AND i.deleted = false AND i.active = true")
    List<Inventory> findNeedingReorderByTenantId(@Param("tenantId") String tenantId);

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND i.expiryDate IS NOT NULL AND i.expiryDate <= :expiryDate AND i.deleted = false AND i.active = true")
    List<Inventory> findExpiringByTenantId(@Param("tenantId") String tenantId, @Param("expiryDate") LocalDate expiryDate);

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND i.expiryDate IS NOT NULL AND i.expiryDate <= :expiryDate AND i.deleted = false AND i.active = true")
    Page<Inventory> findExpiringByTenantId(@Param("tenantId") String tenantId, @Param("expiryDate") LocalDate expiryDate, Pageable pageable);

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND i.expiryDate IS NOT NULL AND i.expiryDate < CURRENT_DATE AND i.deleted = false AND i.active = true")
    List<Inventory> findExpiredByTenantId(@Param("tenantId") String tenantId);

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND " +
           "(LOWER(i.medication.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.medication.medicationCode) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.supplier) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.batchNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "i.deleted = false AND i.active = true")
    List<Inventory> searchByTenantId(@Param("tenantId") String tenantId, @Param("searchTerm") String searchTerm);

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND " +
           "(LOWER(i.medication.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.medication.medicationCode) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.supplier) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.batchNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "i.deleted = false AND i.active = true")
    Page<Inventory> searchByTenantId(@Param("tenantId") String tenantId, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND i.supplier = :supplier AND i.deleted = false AND i.active = true")
    List<Inventory> findByTenantIdAndSupplier(@Param("tenantId") String tenantId, @Param("supplier") String supplier);

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND i.location = :location AND i.deleted = false AND i.active = true")
    List<Inventory> findByTenantIdAndLocation(@Param("tenantId") String tenantId, @Param("location") String location);

    @Query("SELECT DISTINCT i.supplier FROM Inventory i WHERE i.tenantId = :tenantId AND i.supplier IS NOT NULL AND i.deleted = false AND i.active = true ORDER BY i.supplier")
    List<String> findDistinctSuppliersByTenantId(@Param("tenantId") String tenantId);

    @Query("SELECT DISTINCT i.location FROM Inventory i WHERE i.tenantId = :tenantId AND i.location IS NOT NULL AND i.deleted = false AND i.active = true ORDER BY i.location")
    List<String> findDistinctLocationsByTenantId(@Param("tenantId") String tenantId);

    // Batch management methods
    @Query("SELECT COUNT(i) > 0 FROM Inventory i WHERE i.tenantId = :tenantId AND i.batchNumber = :batchNumber AND i.deleted = false")
    boolean existsByTenantIdAndBatchNumber(@Param("tenantId") String tenantId, @Param("batchNumber") String batchNumber);

    @Query("SELECT COUNT(i) > 0 FROM Inventory i WHERE i.tenantId = :tenantId AND i.batchNumber = :batchNumber AND i.id != :excludeId AND i.deleted = false")
    boolean existsByTenantIdAndBatchNumberAndIdNot(@Param("tenantId") String tenantId, @Param("batchNumber") String batchNumber, @Param("excludeId") Long excludeId);

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND i.medication.id = :medicationId AND i.deleted = false AND i.active = true AND " +
           "(i.expiryDate IS NULL OR i.expiryDate > CURRENT_DATE)")
    List<Inventory> findActiveUnexpiredBatchesByTenantIdAndMedicationId(@Param("tenantId") String tenantId, @Param("medicationId") Long medicationId);

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND i.medication.id = :medicationId AND i.deleted = false AND i.active = true AND " +
           "(i.expiryDate IS NULL OR i.expiryDate > CURRENT_DATE) ORDER BY i.expiryDate ASC")
    List<Inventory> findActiveUnexpiredBatchesByTenantIdAndMedicationIdOrderByExpiryDate(@Param("tenantId") String tenantId, @Param("medicationId") Long medicationId);

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND i.expiryDate IS NOT NULL AND i.expiryDate <= CURRENT_DATE AND i.deleted = false AND i.active = true")
    List<Inventory> findExpiredBatchesByTenantId(@Param("tenantId") String tenantId);

    @Query("SELECT i FROM Inventory i WHERE i.tenantId = :tenantId AND i.medication.id = :medicationId AND i.deleted = false")
    List<Inventory> findAllBatchesByTenantIdAndMedicationId(@Param("tenantId") String tenantId, @Param("medicationId") Long medicationId);

    @Query("SELECT DISTINCT i.medication.id FROM Inventory i WHERE i.tenantId = :tenantId AND i.deleted = false AND i.active = true")
    List<Long> findDistinctMedicationIdsByTenantId(@Param("tenantId") String tenantId);
}

