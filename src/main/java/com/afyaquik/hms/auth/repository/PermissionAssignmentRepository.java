

package com.afyaquik.hms.auth.repository;

import com.afyaquik.hms.auth.domain.PermissionAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface PermissionAssignmentRepository extends JpaRepository<PermissionAssignment, Long> {
    List<PermissionAssignment> findByTargetTypeAndTargetId(PermissionAssignment.TargetType targetType, Long targetId);
    List<PermissionAssignment> findByPermission_CodeAndTargetTypeAndTargetId(String code, PermissionAssignment.TargetType targetType, Long targetId);

    @Query("SELECT a FROM PermissionAssignment a JOIN FETCH a.permission WHERE a.targetType = :targetType AND a.targetId = :targetId")
    List<PermissionAssignment> findByTargetTypeAndTargetIdFetchPermission(@Param("targetType") PermissionAssignment.TargetType targetType, @Param("targetId") Long targetId);
}
