package com.afyaquik.hms.admin.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.afyaquik.hms.admin.dto.CreateUserRequest;
import com.afyaquik.hms.admin.dto.UpdateUserRequest;
import com.afyaquik.hms.admin.dto.UpdateUserRolesRequest;
import com.afyaquik.hms.admin.dto.UserDto;
import com.afyaquik.hms.auth.domain.StaffRole;
import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.domain.Tenant;
import com.afyaquik.hms.auth.repository.StaffRoleRepository;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.auth.repository.TenantRepository;

@Service
@Transactional
public class AdminUserService {
    private static final Logger log = LoggerFactory.getLogger(AdminUserService.class);

    private final StaffUserRepository userRepository;
    private final StaffRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminMapper mapper;
    private final TenantRepository tenantRepository;

    public AdminUserService(StaffUserRepository userRepository, StaffRoleRepository roleRepository, PasswordEncoder passwordEncoder, AdminMapper mapper, TenantRepository tenantRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.mapper = mapper;
        this.tenantRepository = tenantRepository;
    }

    public List<UserDto> list(String tenantId) {
        log.debug("Listing users for tenant={}", tenantId);
        return userRepository.findByTenantId(tenantId).stream()
            .filter(u -> !u.isDeleted())
            .map(mapper::toDto)
            .collect(Collectors.toList());
    }

    public UserDto create(String tenantId, CreateUserRequest req) {
        log.info("Creating user tenant={} username={}", tenantId, req.username());
        
        // Check tenant user limit
        Tenant tenant = tenantRepository.findByTenantCode(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));
        
        if (tenant.getMaxUsers() != null) {
            long currentUserCount = userRepository.findByTenantId(tenantId).stream()
                    .filter(u -> !u.isDeleted())
                    .count();
            
            if (currentUserCount >= tenant.getMaxUsers()) {
                log.warn("User limit reached for tenant={} current={} max={}", tenantId, currentUserCount, tenant.getMaxUsers());
                throw new IllegalArgumentException("Maximum number of users reached for this tenant (" + tenant.getMaxUsers() + "). Please contact support to increase the limit.");
            }
        }
        
        userRepository.findByTenantIdAndUsername(tenantId, req.username()).ifPresent(u -> {
            log.warn("Username already exists tenant={} username={}", tenantId, req.username());
            throw new IllegalArgumentException("Username already exists");
        });
        StaffUser user = new StaffUser();
        user.setTenantId(tenantId);
        user.setUsername(req.username());
        user.setDisplayName(req.displayName());
        user.setEmail(req.email());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        if (req.roleKeys() != null) {
            for (String key : req.roleKeys()) {
                roleRepository.findByTenantIdAndRoleKey(tenantId, key).ifPresent(user::addRole);
            }
        }
        UserDto dto = mapper.toDto(userRepository.save(user));
        log.info("User created tenant={} id={}", tenantId, dto.id());
        return dto;
    }

    public UserDto update(String tenantId, Long id, UpdateUserRequest req) {
        log.info("Updating user tenant={} id={}", tenantId, id);
        StaffUser user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
        if (!tenantId.equals(user.getTenantId())) {
            log.warn("Tenant mismatch for update tenant={} id={}", tenantId, id);
            throw new IllegalArgumentException("Tenant mismatch");
        }
        
        // Check if user is tenant super-admin
        if (user.isTenantSuperAdmin()) {
            log.warn("Attempted to update tenant super-admin user tenant={} id={}", tenantId, id);
            throw new IllegalArgumentException("Cannot modify tenant super-admin user. Contact system administrator.");
        }
        
        // Check if user is trying to disable themselves
        String currentUsername = getCurrentUsername();
        if (currentUsername != null && currentUsername.equals(user.getUsername()) && !req.enabled()) {
            log.warn("User attempted to disable themselves tenant={} id={}", tenantId, id);
            throw new IllegalArgumentException("You cannot disable your own account. Ask another administrator to do this.");
        }
        
        user.setDisplayName(req.displayName());
        user.setEmail(req.email());
        user.setEnabled(req.enabled());
        user.setSupervisorId(req.supervisorId());
        user.setSupervisorDisplayName(req.supervisorDisplayName());
        UserDto dto = mapper.toDto(userRepository.save(user));
        log.info("User updated tenant={} id={}", tenantId, id);
        return dto;
    }

    public UserDto updateRoles(String tenantId, Long id, UpdateUserRolesRequest req) {
        log.info("Updating user roles tenant={} id={}", tenantId, id);
        StaffUser user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
        if (!tenantId.equals(user.getTenantId())) {
            log.warn("Tenant mismatch for updateRoles tenant={} id={}", tenantId, id);
            throw new IllegalArgumentException("Tenant mismatch");
        }
        
        // Check if user is tenant super-admin
        if (user.isTenantSuperAdmin()) {
            log.warn("Attempted to update roles for tenant super-admin user tenant={} id={}", tenantId, id);
            throw new IllegalArgumentException("Cannot modify roles for tenant super-admin user. Contact system administrator.");
        }
        Set<StaffRole> newRoles = req.roleKeys().stream()
                .map(k -> roleRepository.findByTenantIdAndRoleKey(tenantId, k).orElseThrow(() -> new IllegalArgumentException("Role not found: " + k)))
                .collect(Collectors.toSet());
        user.setRoles(newRoles);
        UserDto dto = mapper.toDto(userRepository.save(user));
        log.info("User roles updated tenant={} id={}", tenantId, id);
        return dto;
    }

    public void softDelete(String tenantId, Long id) {
        log.info("Soft deleting user tenant={} id={}", tenantId, id);
        StaffUser user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
        if (!tenantId.equals(user.getTenantId())) {
            log.warn("Tenant mismatch for softDelete tenant={} id={}", tenantId, id);
            throw new IllegalArgumentException("Tenant mismatch");
        }
        
        // Check if user is tenant super-admin
        if (user.isTenantSuperAdmin()) {
            log.warn("Attempted to delete tenant super-admin user tenant={} id={}", tenantId, id);
            throw new IllegalArgumentException("Cannot delete tenant super-admin user. Contact system administrator.");
        }
        
        // Check if user is trying to delete themselves
        String currentUsername = getCurrentUsername();
        if (currentUsername != null && currentUsername.equals(user.getUsername())) {
            log.warn("User attempted to delete themselves tenant={} id={}", tenantId, id);
            throw new IllegalArgumentException("You cannot delete your own account. Ask another administrator to do this.");
        }
        
        user.softDelete();
        userRepository.save(user);
        log.info("User soft deleted tenant={} id={}", tenantId, id);
    }

    /**
     * Get current authenticated username
     */
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return null;
    }
}
