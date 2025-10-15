

package com.afyaquik.hms.auth.repository;

import com.afyaquik.hms.common.repository.TenantAwareRepository;
import com.afyaquik.hms.auth.domain.PermissionAssignment;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionAssignmentRepository extends TenantAwareRepository<PermissionAssignment, Long> {
    List<PermissionAssignment> findByTargetTypeAndTargetId(PermissionAssignment.TargetType targetType, Long targetId);
    List<PermissionAssignment> findByPermission_CodeAndTargetTypeAndTargetId(String code, PermissionAssignment.TargetType targetType, Long targetId);

    @Query("SELECT a FROM PermissionAssignment a JOIN FETCH a.permission WHERE a.targetType = :targetType AND a.targetId = :targetId")
    List<PermissionAssignment> findByTargetTypeAndTargetIdFetchPermission(@Param("targetType") PermissionAssignment.TargetType targetType, @Param("targetId") Long targetId);

    // Optimized query to fetch all permission assignments for a user in one go
    @Query("SELECT a FROM PermissionAssignment a JOIN FETCH a.permission WHERE " +
           "(a.targetType = 'USER' AND a.targetId = :userId) OR " +
           "(a.targetType = 'GROUP' AND a.targetId IN :groupIds) OR " +
           "(a.targetType = 'ROLE' AND a.targetId = :roleId)")
    List<PermissionAssignment> findAllAssignmentsForUser(@Param("userId") Long userId, 
                                                        @Param("groupIds") List<Long> groupIds, 
                                                        @Param("roleId") Long roleId);

    // Fetch assignment by ID with permission eagerly loaded
    @Query("SELECT a FROM PermissionAssignment a JOIN FETCH a.permission WHERE a.id = :id")
    Optional<PermissionAssignment> findByIdWithPermission(@Param("id") Long id);
}
