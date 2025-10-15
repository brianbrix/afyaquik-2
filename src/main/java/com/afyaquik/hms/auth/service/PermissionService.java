

    
package com.afyaquik.hms.auth.service;

import com.afyaquik.hms.auth.domain.Permission;
import com.afyaquik.hms.auth.domain.PermissionAssignment;
import com.afyaquik.hms.auth.repository.PermissionAssignmentRepository;
import com.afyaquik.hms.auth.repository.PermissionRepository;
import com.afyaquik.hms.common.domain.BaseEntity;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.afyaquik.hms.auth.dto.PermissionMatrixDto;
import com.afyaquik.hms.auth.dto.PermissionAssignmentDto;
import com.afyaquik.hms.auth.dto.PermissionDto;
import com.afyaquik.hms.auth.dto.PermissionAssignmentResponseDto;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

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
            .map(BaseEntity::getId)
            .orElse(null);
        
        // If no active role found, use the first available role as default
        if (roleId == null && !principal.getUser().getRoles().isEmpty()) {
            roleId = principal.getUser().getRoles().iterator().next().getId();
            log.info("No active role found, using default role: {}", roleId);
        }
        
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

    @Cacheable(value = "permissions", key = "'all'")
    public List<Permission> findAllPermissions() {
        log.debug("Finding all permissions");
        return permissionRepository.findAll();
    }

    public List<PermissionDto> findAllPermissionDtos() {
        log.debug("Finding all permission DTOs");
        return permissionRepository.findAll().stream()
            .map(this::convertToPermissionDto)
            .toList();
    }

    public Optional<Permission> findPermissionByCode(String code) {
        log.debug("Finding permission by code={}", code);
        return permissionRepository.findByCode(code);
    }

    @CacheEvict(value = {"permissions", "permissionMatrix"}, allEntries = true)
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

    /**
     * Upsert permission assignment - update if exists, create if not.
     * Finds existing assignment by permission code, target type, and target ID.
     * If found, updates the state; if not found, creates new assignment.
     */
    @CacheEvict(value = "permissionMatrix", allEntries = true)
    public PermissionAssignmentResponseDto upsertAssignment(String permissionCode, PermissionAssignment.TargetType targetType, Long targetId, PermissionAssignment.State state) {
        log.info("Upserting assignment permissionCode={} targetType={} targetId={} state={}", permissionCode, targetType, targetId, state);
        
        // Find existing assignment
        List<PermissionAssignment> existingAssignments = assignmentRepository.findByPermission_CodeAndTargetTypeAndTargetId(permissionCode, targetType, targetId);
        
        PermissionAssignment savedAssignment;
        if (!existingAssignments.isEmpty()) {
            // Update existing assignment
            PermissionAssignment existing = existingAssignments.get(0);
            existing.setState(state);
            log.info("Updating existing assignment id={} to state={}", existing.getId(), state);
            savedAssignment = assignmentRepository.save(existing);
        } else {
            // Create new assignment
            Optional<Permission> permission = findPermissionByCode(permissionCode);
            if (permission.isEmpty()) {
                throw new IllegalArgumentException("Permission not found: " + permissionCode);
            }
            
            PermissionAssignment newAssignment = new PermissionAssignment(targetType, targetId, permission.get(), state);
            log.info("Creating new assignment for permissionCode={} targetType={} targetId={} state={}", permissionCode, targetType, targetId, state);
            savedAssignment = assignmentRepository.save(newAssignment);
        }
        
        // Fetch the saved assignment with permission eagerly loaded to avoid LazyInitializationException
        Optional<PermissionAssignment> assignmentWithPermission = assignmentRepository.findByIdWithPermission(savedAssignment.getId());
        if (assignmentWithPermission.isPresent()) {
            return convertToPermissionAssignmentResponseDto(assignmentWithPermission.get());
        } else {
            // Fallback to safe conversion if eager loading fails
            return convertToPermissionAssignmentResponseDtoWithPermission(savedAssignment, permissionCode);
        }
    }

    @CacheEvict(value = {"permissionMatrix", "resolvedPermissions"}, allEntries = true)
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

    @Autowired
    private com.afyaquik.hms.auth.repository.StaffUserRepository staffUserRepository;

    /**
     * Get resolved permissions for a user as a Map<String, String>.
     * This method is used by the CustomPermissionEvaluator for @PreAuthorize checks.
     */
    @Cacheable(value = "resolvedPermissions", key = "#username")
    public Map<String, String> getResolvedPermissions(String username) {
        log.info("Getting resolved permissions for username: {}", username);
        
        try {
            // Find user by username with tenant context
            String tenantId = TenantHeaderInterceptor.getCurrentTenant();
            if (tenantId == null) {
                log.warn("No tenant context available for user: {}", username);
                return new HashMap<>();
            }
            
            com.afyaquik.hms.auth.domain.StaffUser user = staffUserRepository.findByTenantIdAndUsernameAndDeletedFalse(tenantId, username);
            if (user == null) {
                log.warn("User not found: {} in tenant: {}", username, tenantId);
                return new HashMap<>();
            }

            // Get active role for the user
            String userIdStr = user.getId().toString();
            Long roleId = activeRoleService.getActiveRole(tenantId, userIdStr)
                .flatMap(roleKey -> user.getRoles().stream()
                    .filter(r -> r.getRoleKey().equals(roleKey))
                    .findFirst())
                .map(BaseEntity::getId)
                .orElse(null);

            if (roleId == null) {
                log.warn("No active role found for user: {}", username);
                return new HashMap<>();
            }

            // Resolve permissions using existing logic
            PermissionMatrixDto permissionMatrix = resolvePermissions(user.getId(), roleId);
            Map<String, String> result = new HashMap<>();
            
            if (permissionMatrix.getPermissions() != null) {
                for (Map.Entry<String, com.afyaquik.hms.auth.domain.PermissionAssignment.State> entry : permissionMatrix.getPermissions().entrySet()) {
                    result.put(entry.getKey(), entry.getValue().name());
                }
            }
            
            return result;
        } catch (Exception e) {
            log.error("Error resolving permissions for user: {}", username, e);
            return new HashMap<>();
        }
    }

    @Cacheable(value = "permissionMatrix", key = "#userId + '_' + #roleId")
    public PermissionMatrixDto resolvePermissions(Long userId, Long roleId) {
        log.info("Resolving permissions userId={} roleId={}", userId, roleId);
        
        // Get user groups in one query
        List<Long> groupIds = findUserGroupIds(userId);
        
        // Get all assignments in a single optimized query
        List<PermissionAssignment> allAssignments = assignmentRepository.findAllAssignmentsForUser(userId, groupIds, roleId);
        
        // Organize assignments by type for efficient lookup
        Map<String, PermissionAssignment> userAssignments = new HashMap<>();
        Map<Long, Map<String, PermissionAssignment>> groupAssignments = new HashMap<>();
        Map<String, PermissionAssignment> roleAssignments = new HashMap<>();
        
        for (PermissionAssignment assignment : allAssignments) {
            String permissionCode = assignment.getPermission().getCode();
            
            switch (assignment.getTargetType()) {
                case USER:
                    userAssignments.put(permissionCode, assignment);
                    break;
                case GROUP:
                    groupAssignments.computeIfAbsent(assignment.getTargetId(), k -> new HashMap<>())
                                   .put(permissionCode, assignment);
                    break;
                case ROLE:
                    roleAssignments.put(permissionCode, assignment);
                    break;
            }
        }
        
        // Get all permissions
        List<Permission> allPerms = findAllPermissions();
        Map<String, PermissionAssignment.State> resolved = new HashMap<>();
        
        for (Permission p : allPerms) {
            PermissionAssignment.State state = PermissionAssignment.State.UNSET;
            
            // 1. User assignment (highest priority)
            PermissionAssignment userA = userAssignments.get(p.getCode());
            if (userA != null && userA.getState() != PermissionAssignment.State.UNSET) {
                state = userA.getState();
                log.debug("Permission {} resolved from USER assignment: {}", p.getCode(), state);
            } else {
                // 2. Group assignments (check all groups, first non-UNSET wins)
                for (Long gid : groupIds) {
                    PermissionAssignment groupA = groupAssignments.getOrDefault(gid, Map.of()).get(p.getCode());
                    if (groupA != null && groupA.getState() != PermissionAssignment.State.UNSET) {
                        state = groupA.getState();
                        log.debug("Permission {} resolved from GROUP {} assignment: {}", p.getCode(), gid, state);
                        break;
                    }
                }
                
                // 3. Role assignment (lowest priority)
                if (state == PermissionAssignment.State.UNSET && roleId != null) {
                    PermissionAssignment roleA = roleAssignments.get(p.getCode());
                    if (roleA != null && roleA.getState() != PermissionAssignment.State.UNSET) {
                        state = roleA.getState();
                        log.debug("Permission {} resolved from ROLE {} assignment: {}", p.getCode(), roleId, state);
                    }
                }
            }
            
            resolved.put(p.getCode(), state);
        }
        
        log.debug("Resolved {} permissions for userId={}", resolved.size(), userId);
        return new PermissionMatrixDto(resolved);
    }

    /**
     * Convert Permission entity to PermissionDto
     */
    private PermissionDto convertToPermissionDto(Permission permission) {
        return new PermissionDto(
            permission.getId(),
            permission.getCode(),
            permission.getDescription()
        );
    }

    /**
     * Convert PermissionAssignment entity to PermissionAssignmentResponseDto
     * This method should only be used when the Permission entity is eagerly loaded
     */
    private PermissionAssignmentResponseDto convertToPermissionAssignmentResponseDto(PermissionAssignment assignment) {
        return new PermissionAssignmentResponseDto(
            assignment.getId(),
            assignment.getTargetType().name(),
            assignment.getTargetId(),
            assignment.getPermission().getCode(),
            assignment.getPermission().getDescription(),
            assignment.getState().name()
        );
    }

    /**
     * Convert PermissionAssignment entity to PermissionAssignmentResponseDto with permission details
     * This method avoids LazyInitializationException by using the permission code and fetching description separately
     */
    private PermissionAssignmentResponseDto convertToPermissionAssignmentResponseDtoWithPermission(PermissionAssignment assignment, String permissionCode) {
        // Get permission description safely
        String permissionDescription = "Unknown Permission";
        try {
            Optional<Permission> permission = findPermissionByCode(permissionCode);
            if (permission.isPresent()) {
                permissionDescription = permission.get().getDescription();
            }
        } catch (Exception e) {
            log.warn("Could not fetch permission description for code: {}", permissionCode, e);
        }
        
        return new PermissionAssignmentResponseDto(
            assignment.getId(),
            assignment.getTargetType().name(),
            assignment.getTargetId(),
            permissionCode,
            permissionDescription,
            assignment.getState().name()
        );
    }
   
}
