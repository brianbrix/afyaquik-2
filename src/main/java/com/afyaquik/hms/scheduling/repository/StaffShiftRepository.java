package com.afyaquik.hms.scheduling.repository;

import com.afyaquik.hms.scheduling.domain.StaffShift;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.time.OffsetDateTime;
import java.util.List;

public interface StaffShiftRepository extends JpaRepository<StaffShift, Long>, JpaSpecificationExecutor<StaffShift> {

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

}
