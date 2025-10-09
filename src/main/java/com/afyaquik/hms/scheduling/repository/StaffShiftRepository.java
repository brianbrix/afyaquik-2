package com.afyaquik.hms.scheduling.repository;

import com.afyaquik.hms.scheduling.domain.ShiftStatus;
import com.afyaquik.hms.scheduling.domain.StaffShift;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StaffShiftRepository extends JpaRepository<StaffShift, Long> {

    List<StaffShift> findByTenantIdAndStartsAtBetweenOrderByStartsAtAsc(
	    String tenantId,
	    OffsetDateTime rangeStart,
	    OffsetDateTime rangeEnd);

    List<StaffShift> findByTenantIdAndStaffUser_IdOrderByStartsAtAsc(String tenantId, Long staffUserId);

    List<StaffShift> findByTenantIdAndStaffUser_IdAndStartsAtBetweenOrderByStartsAtAsc(
	    String tenantId,
	    Long staffUserId,
	    OffsetDateTime rangeStart,
	    OffsetDateTime rangeEnd);

    List<StaffShift> findByTenantIdAndStatusOrderByStartsAtAsc(String tenantId, ShiftStatus status);

    List<StaffShift> findByTenantIdOrderByStartsAtAsc(String tenantId);
	List<StaffShift> findByRoleKey(String roleKey);

    @Query("""
	    SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END
	    FROM StaffShift s
	    WHERE s.tenantId = :tenantId
	      AND s.staffUser.id = :staffUserId
	      AND (:excludeId IS NULL OR s.id <> :excludeId)
	      AND s.startsAt < :endsAt
	      AND s.endsAt > :startsAt
	    """)
    boolean existsOverlappingShift(
	    @Param("tenantId") String tenantId,
	    @Param("staffUserId") Long staffUserId,
	    @Param("startsAt") OffsetDateTime startsAt,
	    @Param("endsAt") OffsetDateTime endsAt,
	    @Param("excludeId") Long excludeId);

    boolean existsByTenantId(String tenantId);
}
