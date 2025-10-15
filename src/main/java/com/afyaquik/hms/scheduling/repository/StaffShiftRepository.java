package com.afyaquik.hms.scheduling.repository;

import com.afyaquik.hms.scheduling.domain.StaffShift;
import com.afyaquik.hms.scheduling.domain.ShiftStatus;
import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.time.OffsetDateTime;
import java.util.List;

public interface StaffShiftRepository extends TenantAwareRepository<StaffShift, Long>, JpaSpecificationExecutor<StaffShift> {

    // Default method for overlap check using specification
    default boolean existsOverlappingShift(String tenantId, Long staffUserId, OffsetDateTime startsAt, OffsetDateTime endsAt, Long excludeId) {
        var spec = (org.springframework.data.jpa.domain.Specification<StaffShift>) (root, query, cb) -> {
            var p = cb.conjunction();
            p = cb.and(p, cb.equal(root.get("tenantId"), tenantId));
            p = cb.and(p, cb.equal(root.get("staffUser").get("id"), staffUserId));
            if (excludeId != null) {
                p = cb.and(p, cb.notEqual(root.get("id"), excludeId));
            }
            p = cb.and(p, cb.lessThan(root.get("startsAt"), endsAt));
            p = cb.and(p, cb.greaterThan(root.get("endsAt"), startsAt));
            return p;
        };
        return this.count(spec) > 0;
    }

    // Default method for pending check-in
    default List<StaffShift> findPendingCheckIn(String tenantId, Long staffUserId, com.afyaquik.hms.scheduling.domain.ShiftStatus status, OffsetDateTime before) {
        var spec = (org.springframework.data.jpa.domain.Specification<StaffShift>) (root, query, cb) -> {
            var p = cb.conjunction();
            p = cb.and(p, cb.equal(root.get("tenantId"), tenantId));
            p = cb.and(p, cb.equal(root.get("staffUser").get("id"), staffUserId));
            p = cb.and(p, cb.equal(root.get("status"), status));
            p = cb.and(p, cb.lessThan(root.get("startsAt"), before));
            return p;
        };
        return this.findAll(spec);
    }

    // Default method for pending check-out
    default List<StaffShift> findPendingCheckOut(String tenantId, Long staffUserId, List<com.afyaquik.hms.scheduling.domain.ShiftStatus> statuses, OffsetDateTime before) {
        var spec = (org.springframework.data.jpa.domain.Specification<StaffShift>) (root, query, cb) -> {
            var p = cb.conjunction();
            p = cb.and(p, cb.equal(root.get("tenantId"), tenantId));
            p = cb.and(p, cb.equal(root.get("staffUser").get("id"), staffUserId));
            p = cb.and(p, root.get("status").in(statuses));
            p = cb.and(p, cb.lessThan(root.get("endsAt"), before));
            return p;
        };
        return this.findAll(spec);
    }

    // Default method for existsByTenantId
    default boolean existsByTenantId(String tenantId) {
        return false;
    }
    
    // Find shifts by multiple staff user IDs and status
    List<StaffShift> findByStaffUserIdInAndStatusOrderByCreatedAtDesc(List<Long> staffUserIds, ShiftStatus status);
    
    // Count shifts by multiple staff user IDs and status
    long countByStaffUserIdInAndStatus(List<Long> staffUserIds, ShiftStatus status);
    
    // Tenant-aware default methods
    default boolean existsOverlappingShiftForCurrentTenant(Long staffUserId, OffsetDateTime startsAt, OffsetDateTime endsAt, Long excludeId) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return existsOverlappingShift(tenantId, staffUserId, startsAt, endsAt, excludeId);
    }
    
    default List<StaffShift> findPendingCheckInForCurrentTenant(Long staffUserId, ShiftStatus status, OffsetDateTime before) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findPendingCheckIn(tenantId, staffUserId, status, before);
    }
    
    default List<StaffShift> findPendingCheckOutForCurrentTenant(Long staffUserId, List<ShiftStatus> statuses, OffsetDateTime before) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findPendingCheckOut(tenantId, staffUserId, statuses, before);
    }
    
    default List<StaffShift> findShiftsByStaffUserIdAndStatusForCurrentTenant(Long staffUserId, ShiftStatus status) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        // Use the existing method that doesn't require tenantId
        return findByStaffUserIdInAndStatusOrderByCreatedAtDesc(List.of(staffUserId), status);
    }
    
    default List<StaffShift> findShiftsByStaffUserIdInAndStatusForCurrentTenant(List<Long> staffUserIds, ShiftStatus status) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return findByStaffUserIdInAndStatusOrderByCreatedAtDesc(staffUserIds, status);
    }
    
    default long countShiftsByStaffUserIdInAndStatusForCurrentTenant(List<Long> staffUserIds, ShiftStatus status) {
        String tenantId = TenantHeaderInterceptor.getCurrentTenant();
        return countByStaffUserIdInAndStatus(staffUserIds, status);
    }

    // Dashboard methods
    List<StaffShift> findByStaffUserIdAndStartsAtBetween(Long staffUserId, OffsetDateTime start, OffsetDateTime end);

}
