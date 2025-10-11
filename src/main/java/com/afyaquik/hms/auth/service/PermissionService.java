

    
package com.afyaquik.hms.auth.service;

import com.afyaquik.hms.auth.domain.Permission;
import com.afyaquik.hms.auth.domain.PermissionAssignment;
import com.afyaquik.hms.auth.repository.PermissionAssignmentRepository;
import com.afyaquik.hms.auth.repository.PermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.afyaquik.hms.auth.dto.PermissionMatrixDto;
import com.afyaquik.hms.auth.dto.PermissionAssignmentDto;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@Service
public class PermissionService {

    private static final Logger log = LoggerFactory.getLogger(PermissionService.class);
    @Autowired
    private com.afyaquik.hms.auth.service.ActiveRoleService activeRoleService;

    public PermissionMatrixDto resolvePermissionsForSession(String tenantHeader, org.springframework.security.core.Authentication authentication) {
        log.info("Resolving permissions for session tenantHeader={}", tenantHeader);
        String tenantId = com.afyaquik.hms.common.web.TenantHeaderResolver.resolveTenantId(tenantHeader);
        if (tenantId == null) {
            log.warn("X-Tenant-Id header is missing");
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "X-Tenant-Id header is required");
        }
        com.afyaquik.hms.auth.security.TenantUserDetails principal = (com.afyaquik.hms.auth.security.TenantUserDetails) authentication.getPrincipal();
        if (!principal.getUser().getTenantId().equals(tenantId)) {
            log.warn("Tenant mismatch for session principal tenant={} header tenant={}", principal.getUser().getTenantId(), tenantId);
            throw new org.springframework.security.access.AccessDeniedException("Tenant mismatch");
        }
        Long userId = principal.getUser().getId();
        String userIdStr = userId.toString();
        Long roleId = activeRoleService.getActiveRole(tenantId, userIdStr)
            .flatMap(roleKey -> principal.getUser().getRoles().stream().filter(r -> r.getRoleKey().equals(roleKey)).findFirst())
            .map(r -> r.getId())
            .orElse(null);
        log.info("Session resolve: userId={} roleId={}", userId, roleId);
        return resolvePermissions(userId, roleId);
    }
    @Autowired
    private com.afyaquik.hms.auth.repository.UserGroupRepository userGroupRepository;

    /**
     * Returns a list of group IDs for the given userId by checking all groups for membership.
     */
    private List<Long> findUserGroupIds(Long userId) {
    return userGroupRepository.findGroupIdsByMemberId(userId);
    }
    private final PermissionRepository permissionRepository;
    private final PermissionAssignmentRepository assignmentRepository;

    @Autowired
    public PermissionService(PermissionRepository permissionRepository, PermissionAssignmentRepository assignmentRepository) {
        this.permissionRepository = permissionRepository;
        this.assignmentRepository = assignmentRepository;
    }

    public List<Permission> findAllPermissions() {
        log.debug("Finding all permissions");
        return permissionRepository.findAll();
    }

    public Optional<Permission> findPermissionByCode(String code) {
        log.debug("Finding permission by code={}", code);
        return permissionRepository.findByCode(code);
    }

    public Permission savePermission(Permission permission) {
        log.info("Saving permission code={}", permission.getCode());
        return permissionRepository.save(permission);
    }

    public List<PermissionAssignment> findAssignments(PermissionAssignment.TargetType type, Long id) {
        log.debug("Finding assignments type={} id={}", type, id);
        return assignmentRepository.findByTargetTypeAndTargetId(type, id);
    }

    public PermissionAssignment saveAssignment(PermissionAssignment assignment) {
        log.info("Saving assignment id={} targetType={} targetId={} code={}", assignment.getId(), assignment.getTargetType(), assignment.getTargetId(), assignment.getPermission().getCode());
        return assignmentRepository.save(assignment);
    }

    public void deleteAssignment(Long id) {
        log.info("Deleting assignment id={}", id);
        assignmentRepository.deleteById(id);
    }
    public PermissionMatrixDto getMatrix(PermissionAssignment.TargetType targetType, Long targetId) {
        log.info("Getting permission matrix targetType={} targetId={}", targetType, targetId);
        // Use fetch join to eagerly load Permission entities and avoid LazyInitializationException
        List<PermissionAssignment> assignments = assignmentRepository.findByTargetTypeAndTargetIdFetchPermission(targetType, targetId);
        Map<String, PermissionAssignment.State> map = new HashMap<>();
        for (PermissionAssignment a : assignments) {
            map.put(a.getPermission().getCode(), a.getState());
        }
        return new PermissionMatrixDto(map);
    }

    public List<PermissionAssignmentDto> findAssignmentDtos(PermissionAssignment.TargetType type, Long id) {
        log.debug("Finding assignment DTOs type={} id={}", type, id);
        return findAssignments(type, id)
            .stream()
            .map(a -> new PermissionAssignmentDto(
                a.getId(),
                a.getTargetType().name(),
                a.getTargetId(),
                a.getPermission().getCode(),
                a.getPermission().getDescription(),
                a.getState().name()
            ))
            .toList();
    }

    public PermissionMatrixDto resolvePermissions(Long userId, Long roleId) {
        log.info("Resolving permissions userId={} roleId={}", userId, roleId);
        List<Long> groupIds = findUserGroupIds(userId);
        List<Permission> allPerms = findAllPermissions();
        Map<String, PermissionAssignment.State> resolved = new HashMap<>();
        // Use fetch join for all assignments to avoid LazyInitializationException
        List<PermissionAssignment> userAssignments = assignmentRepository.findByTargetTypeAndTargetIdFetchPermission(PermissionAssignment.TargetType.USER, userId);
        Map<String, PermissionAssignment> userMap = new HashMap<>();
        for (PermissionAssignment a : userAssignments) {
            userMap.put(a.getPermission().getCode(), a);
        }
        Map<Long, Map<String, PermissionAssignment>> groupMaps = new HashMap<>();
        for (Long gid : groupIds) {
            List<PermissionAssignment> groupAssignments = assignmentRepository.findByTargetTypeAndTargetIdFetchPermission(PermissionAssignment.TargetType.GROUP, gid);
            Map<String, PermissionAssignment> groupMap = new HashMap<>();
            for (PermissionAssignment a : groupAssignments) {
                groupMap.put(a.getPermission().getCode(), a);
            }
            groupMaps.put(gid, groupMap);
        }
        Map<String, PermissionAssignment> roleMap = new HashMap<>();
        if (roleId != null) {
            List<PermissionAssignment> roleAssignments = assignmentRepository.findByTargetTypeAndTargetIdFetchPermission(PermissionAssignment.TargetType.ROLE, roleId);
            for (PermissionAssignment a : roleAssignments) {
                roleMap.put(a.getPermission().getCode(), a);
            }
        }
        for (Permission p : allPerms) {
            PermissionAssignment.State state = PermissionAssignment.State.UNSET;
            // 1. User
            PermissionAssignment userA = userMap.get(p.getCode());
            if (userA != null && userA.getState() != PermissionAssignment.State.UNSET) {
                state = userA.getState();
            } else {
                // 2. Group (first non-UNSET wins)
                for (Long gid : groupIds) {
                    PermissionAssignment groupA = groupMaps.getOrDefault(gid, Map.of()).get(p.getCode());
                    if (groupA != null && groupA.getState() != PermissionAssignment.State.UNSET) {
                        state = groupA.getState();
                        break;
                    }
                }
                // 3. Role (single active role)
                if (state == PermissionAssignment.State.UNSET && roleId != null) {
                    PermissionAssignment roleA = roleMap.get(p.getCode());
                    if (roleA != null && roleA.getState() != PermissionAssignment.State.UNSET) {
                        state = roleA.getState();
                    }
                }
            }
            resolved.put(p.getCode(), state);
        }
        log.debug("Resolved {} permissions for userId={}", resolved.size(), userId);
        return new PermissionMatrixDto(resolved);
    }
   
}
