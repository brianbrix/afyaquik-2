package com.afyaquik.hms.audit.repository;

import com.afyaquik.hms.audit.domain.AuditLog;
import com.afyaquik.hms.audit.dto.AuditLogFilterRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Repository for audit log operations.
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Find audit logs by tenant with pagination.
     */
    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTenantIdOrderByTimestampDesc(@Param("tenantId") String tenantId, Pageable pageable);

    /**
     * Find audit logs by date range.
     */
    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId AND a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTenantIdAndTimestampBetween(
            @Param("tenantId") String tenantId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate,
            Pageable pageable);

    /**
     * Find audit logs by user.
     */
    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId AND a.userId = :userId ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTenantIdAndUserIdOrderByTimestampDesc(
            @Param("tenantId") String tenantId,
            @Param("userId") Long userId,
            Pageable pageable);

    /**
     * Find audit logs by action.
     */
    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId AND a.action = :action ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTenantIdAndActionOrderByTimestampDesc(
            @Param("tenantId") String tenantId,
            @Param("action") String action,
            Pageable pageable);

    /**
     * Find audit logs by entity type.
     */
    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId AND a.entityType = :entityType ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTenantIdAndEntityTypeOrderByTimestampDesc(
            @Param("tenantId") String tenantId,
            @Param("entityType") String entityType,
            Pageable pageable);

    /**
     * Find audit logs by status.
     */
    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId AND a.status = :status ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTenantIdAndStatusOrderByTimestampDesc(
            @Param("tenantId") String tenantId,
            @Param("status") String status,
            Pageable pageable);

    /**
     * Find audit logs by IP address.
     */
    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId AND a.ipAddress = :ipAddress ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTenantIdAndIpAddressOrderByTimestampDesc(
            @Param("tenantId") String tenantId,
            @Param("ipAddress") String ipAddress,
            Pageable pageable);

    /**
     * Find audit logs by session ID.
     */
    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId AND a.sessionId = :sessionId ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTenantIdAndSessionIdOrderByTimestampDesc(
            @Param("tenantId") String tenantId,
            @Param("sessionId") String sessionId,
            Pageable pageable);

    /**
     * Find audit logs by request ID.
     */
    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId AND a.requestId = :requestId ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTenantIdAndRequestIdOrderByTimestampDesc(
            @Param("tenantId") String tenantId,
            @Param("requestId") String requestId,
            Pageable pageable);

    /**
     * Find audit logs by endpoint.
     */
    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId AND a.endpoint LIKE %:endpoint% ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTenantIdAndEndpointContainingOrderByTimestampDesc(
            @Param("tenantId") String tenantId,
            @Param("endpoint") String endpoint,
            Pageable pageable);

    /**
     * Find audit logs by HTTP method.
     */
    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId AND a.httpMethod = :httpMethod ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTenantIdAndHttpMethodOrderByTimestampDesc(
            @Param("tenantId") String tenantId,
            @Param("httpMethod") String httpMethod,
            Pageable pageable);

    /**
     * Find audit logs by response status range.
     */
    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId AND a.responseStatus BETWEEN :minStatus AND :maxStatus ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTenantIdAndResponseStatusBetweenOrderByTimestampDesc(
            @Param("tenantId") String tenantId,
            @Param("minStatus") Integer minStatus,
            @Param("maxStatus") Integer maxStatus,
            Pageable pageable);

    /**
     * Find audit logs by duration range.
     */
    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId AND a.durationMs BETWEEN :minDuration AND :maxDuration ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTenantIdAndDurationMsBetweenOrderByTimestampDesc(
            @Param("tenantId") String tenantId,
            @Param("minDuration") Long minDuration,
            @Param("maxDuration") Long maxDuration,
            Pageable pageable);

    /**
     * Find audit logs by search term (searches in action, entityType, username, endpoint).
     */
    @Query("SELECT a FROM AuditLog a WHERE a.tenantId = :tenantId AND " +
           "(LOWER(a.action) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.entityType) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(a.endpoint) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY a.timestamp DESC")
    Page<AuditLog> findByTenantIdAndSearchTermOrderByTimestampDesc(
            @Param("tenantId") String tenantId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);

    /**
     * Get distinct actions for a tenant.
     */
    @Query("SELECT DISTINCT a.action FROM AuditLog a WHERE a.tenantId = :tenantId ORDER BY a.action")
    List<String> findDistinctActionsByTenantId(@Param("tenantId") String tenantId);

    /**
     * Get distinct entity types for a tenant.
     */
    @Query("SELECT DISTINCT a.entityType FROM AuditLog a WHERE a.tenantId = :tenantId ORDER BY a.entityType")
    List<String> findDistinctEntityTypesByTenantId(@Param("tenantId") String tenantId);

    /**
     * Get distinct statuses for a tenant.
     */
    @Query("SELECT DISTINCT a.status FROM AuditLog a WHERE a.tenantId = :tenantId ORDER BY a.status")
    List<String> findDistinctStatusesByTenantId(@Param("tenantId") String tenantId);

    /**
     * Get distinct HTTP methods for a tenant.
     */
    @Query("SELECT DISTINCT a.httpMethod FROM AuditLog a WHERE a.tenantId = :tenantId ORDER BY a.httpMethod")
    List<String> findDistinctHttpMethodsByTenantId(@Param("tenantId") String tenantId);

    /**
     * Count audit logs by tenant.
     */
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.tenantId = :tenantId")
    long countByTenantId(@Param("tenantId") String tenantId);

    /**
     * Count audit logs by tenant and date range.
     */
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.tenantId = :tenantId AND a.timestamp BETWEEN :startDate AND :endDate")
    long countByTenantIdAndTimestampBetween(
            @Param("tenantId") String tenantId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate);

    /**
     * Count audit logs by tenant and status.
     */
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.tenantId = :tenantId AND a.status = :status")
    long countByTenantIdAndStatus(@Param("tenantId") String tenantId, @Param("status") String status);

    /**
     * Count audit logs by tenant and action.
     */
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.tenantId = :tenantId AND a.action = :action")
    long countByTenantIdAndAction(@Param("tenantId") String tenantId, @Param("action") String action);

    /**
     * Count audit logs by tenant and entity type.
     */
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.tenantId = :tenantId AND a.entityType = :entityType")
    long countByTenantIdAndEntityType(@Param("tenantId") String tenantId, @Param("entityType") String entityType);

    /**
     * Count audit logs by tenant and user.
     */
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.tenantId = :tenantId AND a.userId = :userId")
    long countByTenantIdAndUserId(@Param("tenantId") String tenantId, @Param("userId") Long userId);

    /**
     * Get audit log statistics for a tenant.
     */
    @Query("SELECT " +
           "COUNT(a) as totalLogs, " +
           "COUNT(CASE WHEN a.status = 'SUCCESS' THEN 1 END) as successLogs, " +
           "COUNT(CASE WHEN a.status = 'ERROR' THEN 1 END) as errorLogs, " +
           "AVG(a.durationMs) as avgDuration, " +
           "MAX(a.durationMs) as maxDuration, " +
           "MIN(a.durationMs) as minDuration " +
           "FROM AuditLog a WHERE a.tenantId = :tenantId")
    Object[] getAuditLogStatistics(@Param("tenantId") String tenantId);

    /**
     * Get audit log statistics for a tenant and date range.
     */
    @Query("SELECT " +
           "COUNT(a) as totalLogs, " +
           "COUNT(CASE WHEN a.status = 'SUCCESS' THEN 1 END) as successLogs, " +
           "COUNT(CASE WHEN a.status = 'ERROR' THEN 1 END) as errorLogs, " +
           "AVG(a.durationMs) as avgDuration, " +
           "MAX(a.durationMs) as maxDuration, " +
           "MIN(a.durationMs) as minDuration " +
           "FROM AuditLog a WHERE a.tenantId = :tenantId AND a.timestamp BETWEEN :startDate AND :endDate")
    Object[] getAuditLogStatisticsForDateRange(
            @Param("tenantId") String tenantId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate);
}
