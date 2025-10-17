package com.afyaquik.hms.scheduling.repository;

import com.afyaquik.hms.scheduling.domain.ShiftStatus;
import com.afyaquik.hms.scheduling.domain.StaffShift;
import com.afyaquik.hms.scheduling.domain.ShiftType;
import com.afyaquik.hms.auth.domain.StaffRole;
import com.afyaquik.hms.auth.domain.Department;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class StaffShiftSpecifications {
    public static Specification<StaffShift> withFilters(
            String tenantId,
            Long staffUserId,
            ShiftStatus status,
            StaffRole role,
            Department department,
            ShiftType shiftType,
            LocalDateTime rangeStart,
            LocalDateTime rangeEnd
    ) {
        return (root, query, cb) -> {
            var predicates = cb.conjunction();
            predicates = cb.and(predicates, cb.equal(root.get("tenantId"), tenantId));
            if (staffUserId != null) {
                predicates = cb.and(predicates, cb.equal(root.get("staffUser").get("id"), staffUserId));
            }
            if (status != null) {
                predicates = cb.and(predicates, cb.equal(root.get("status"), status));
            }
            if (role != null) {
                predicates = cb.and(predicates, cb.equal(root.get("role"), role));
            }
            if (department != null) {
                predicates = cb.and(predicates, cb.equal(root.get("department"), department));
            }
            if (shiftType != null) {
                predicates = cb.and(predicates, cb.equal(root.get("shiftType"), shiftType));
            }
            if (rangeStart != null) {
                predicates = cb.and(predicates, cb.greaterThanOrEqualTo(root.get("startsAt"), rangeStart));
            }
            if (rangeEnd != null) {
                predicates = cb.and(predicates, cb.lessThanOrEqualTo(root.get("endsAt"), rangeEnd));
            }
            return predicates;
        };
    }
}
