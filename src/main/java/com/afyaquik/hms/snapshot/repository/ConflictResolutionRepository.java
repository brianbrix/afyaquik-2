package com.afyaquik.hms.snapshot.repository;

import com.afyaquik.hms.snapshot.domain.ConflictResolution;
import com.afyaquik.hms.snapshot.domain.ConflictStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConflictResolutionRepository extends JpaRepository<ConflictResolution, String> {

    /**
     * Find conflicts by tenant ID and device ID
     */
    List<ConflictResolution> findByTenantIdAndDeviceIdAndStatusOrderByCreatedAtDesc(
            String tenantId, String deviceId, ConflictStatus status);

    /**
     * Find conflicts by tenant ID and status
     */
    List<ConflictResolution> findByTenantIdAndStatusOrderByCreatedAtDesc(
            String tenantId, ConflictStatus status);

    /**
     * Find conflicts by tenant ID
     */
    List<ConflictResolution> findByTenantIdOrderByCreatedAtDesc(String tenantId);

    /**
     * Find conflicts by entity type and entity ID
     */
    List<ConflictResolution> findByTenantIdAndEntityTypeAndEntityIdOrderByCreatedAtDesc(
            String tenantId, String entityType, String entityId);

    /**
     * Count conflicts by tenant ID
     */
    long countByTenantId(String tenantId);

    /**
     * Count conflicts by tenant ID and status
     */
    long countByTenantIdAndStatus(String tenantId, ConflictStatus status);

    /**
     * Find old resolved conflicts for cleanup
     */
    @Query("SELECT c FROM ConflictResolution c WHERE c.tenantId = :tenantId " +
           "AND c.status = :status AND c.resolvedAt < :cutoffDate")
    List<ConflictResolution> findByTenantIdAndStatusAndResolvedAtBefore(
            @Param("tenantId") String tenantId,
            @Param("status") ConflictStatus status,
            @Param("cutoffDate") LocalDateTime cutoffDate);

    /**
     * Find conflicts by device ID and entity
     */
    List<ConflictResolution> findByTenantIdAndDeviceIdAndEntityTypeAndEntityIdOrderByCreatedAtDesc(
            String tenantId, String deviceId, String entityType, String entityId);

    /**
     * Find pending conflicts for a specific entity
     */
    @Query("SELECT c FROM ConflictResolution c WHERE c.tenantId = :tenantId " +
           "AND c.entityType = :entityType AND c.entityId = :entityId " +
           "AND c.status = 'PENDING' ORDER BY c.createdAt DESC")
    List<ConflictResolution> findPendingConflictsForEntity(
            @Param("tenantId") String tenantId,
            @Param("entityType") String entityType,
            @Param("entityId") String entityId);

    /**
     * Find conflicts resolved by a specific device
     */
    List<ConflictResolution> findByTenantIdAndResolvedByDeviceIdOrderByResolvedAtDesc(
            String tenantId, String deviceId);

    /**
     * Find conflicts created within a time range
     */
    @Query("SELECT c FROM ConflictResolution c WHERE c.tenantId = :tenantId " +
           "AND c.createdAt BETWEEN :startDate AND :endDate ORDER BY c.createdAt DESC")
    List<ConflictResolution> findByTenantIdAndCreatedAtBetween(
            @Param("tenantId") String tenantId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
