package com.afyaquik.hms.scheduling.repository;

import com.afyaquik.hms.scheduling.domain.TimeOffRequest;
import com.afyaquik.hms.scheduling.domain.TimeOffStatus;
import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimeOffRequestRepository extends TenantAwareRepository<TimeOffRequest, Long> {

    // Find requests by user
    List<TimeOffRequest> findByTenantIdAndUserIdOrderBySubmittedAtDesc(String tenantId, Long userId);

    // Find requests for supervisor to review
    List<TimeOffRequest> findByTenantIdAndSupervisorIdOrderBySubmittedAtDesc(String tenantId, Long supervisorId);

    // Find requests by status
    List<TimeOffRequest> findByTenantIdAndStatusOrderBySubmittedAtDesc(String tenantId, TimeOffStatus status);

    // Find requests by date range
    @Query("SELECT t FROM TimeOffRequest t WHERE t.tenantId = :tenantId " +
           "AND ((t.startDate <= :endDate AND t.endDate >= :startDate) OR " +
           "(t.startDate >= :startDate AND t.startDate <= :endDate)) " +
           "ORDER BY t.submittedAt DESC")
    Page<TimeOffRequest> findByDateRange(@Param("tenantId") String tenantId,
                                        @Param("startDate") LocalDate startDate,
                                        @Param("endDate") LocalDate endDate,
                                        Pageable pageable);
    
    @Query("SELECT t FROM TimeOffRequest t WHERE t.tenantId = :tenantId " +
           "AND ((t.startDate <= :endDate AND t.endDate >= :startDate) OR " +
           "(t.startDate >= :startDate AND t.startDate <= :endDate)) " +
           "ORDER BY t.submittedAt DESC")
    List<TimeOffRequest> findByDateRange(@Param("tenantId") String tenantId,
                                        @Param("startDate") LocalDate startDate,
                                        @Param("endDate") LocalDate endDate);

    // Find overlapping requests for a user
    @Query("SELECT t FROM TimeOffRequest t WHERE t.tenantId = :tenantId " +
           "AND t.userId = :userId " +
           "AND t.status IN ('PENDING', 'APPROVED') " +
           "AND ((t.startDate <= :endDate AND t.endDate >= :startDate) OR " +
           "(t.startDate >= :startDate AND t.startDate <= :endDate))")
    List<TimeOffRequest> findOverlappingRequests(@Param("tenantId") String tenantId,
                                               @Param("userId") Long userId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);

    // Count pending requests for supervisor
    long countByTenantIdAndSupervisorIdAndStatus(String tenantId, Long supervisorId, TimeOffStatus status);

    // Find all requests for admin
    List<TimeOffRequest> findByTenantIdOrderBySubmittedAtDesc(String tenantId);
    
    // Find requests by multiple user IDs and status
    List<TimeOffRequest> findByUserIdInAndStatusOrderByCreatedAtDesc(List<Long> userIds, TimeOffStatus status);
    
    // Count requests by multiple user IDs and status
    long countByUserIdInAndStatus(List<Long> userIds, TimeOffStatus status);
    
    // Tenant-aware default methods
    default List<TimeOffRequest> findByUserIdForCurrentTenant(Long userId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndUserIdOrderBySubmittedAtDesc(tenantId, userId);
    }
    
    default List<TimeOffRequest> findBySupervisorIdForCurrentTenant(Long supervisorId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndSupervisorIdOrderBySubmittedAtDesc(tenantId, supervisorId);
    }
    
    default List<TimeOffRequest> findByStatusForCurrentTenant(TimeOffStatus status) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdAndStatusOrderBySubmittedAtDesc(tenantId, status);
    }
    
    default List<TimeOffRequest> findByDateRangeForCurrentTenant(LocalDate startDate, LocalDate endDate) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByDateRange(tenantId, startDate, endDate);
    }
    
    default List<TimeOffRequest> findOverlappingRequestsForCurrentTenant(Long userId, LocalDate startDate, LocalDate endDate) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findOverlappingRequests(tenantId, userId, startDate, endDate);
    }
    
    default long countBySupervisorIdAndStatusForCurrentTenant(Long supervisorId, TimeOffStatus status) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return countByTenantIdAndSupervisorIdAndStatus(tenantId, supervisorId, status);
    }
    
    default List<TimeOffRequest> findAllForCurrentTenant() {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByTenantIdOrderBySubmittedAtDesc(tenantId);
    }

    // Dashboard methods
    long countByTenantIdAndUserIdAndStatus(String tenantId, Long userId, TimeOffStatus status);
}
