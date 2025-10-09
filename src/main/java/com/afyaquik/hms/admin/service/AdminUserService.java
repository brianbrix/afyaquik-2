package com.afyaquik.hms.admin.service;

import com.afyaquik.hms.admin.dto.CreateUserRequest;
import com.afyaquik.hms.admin.dto.UpdateUserRequest;
import com.afyaquik.hms.admin.dto.UpdateUserRolesRequest;
import com.afyaquik.hms.admin.dto.UserDto;
import com.afyaquik.hms.auth.domain.StaffRole;
import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.StaffRoleRepository;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminUserService {

    private final StaffUserRepository userRepository;
    private final StaffRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminMapper mapper;

    public AdminUserService(StaffUserRepository userRepository, StaffRoleRepository roleRepository, PasswordEncoder passwordEncoder, AdminMapper mapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.mapper = mapper;
    }

    public List<UserDto> list(String tenantId) {
    return userRepository.findByTenantId(tenantId).stream()
        .filter(u -> !u.isDeleted())
        .map(mapper::toDto)
        .collect(Collectors.toList());
    }

    public UserDto create(String tenantId, CreateUserRequest req) {
        userRepository.findByTenantIdAndUsername(tenantId, req.username()).ifPresent(u -> {
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
        return mapper.toDto(userRepository.save(user));
    }

    public UserDto update(String tenantId, Long id, UpdateUserRequest req) {
        StaffUser user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
        if (!tenantId.equals(user.getTenantId())) {
            throw new IllegalArgumentException("Tenant mismatch");
        }
        user.setDisplayName(req.displayName());
        user.setEmail(req.email());
        user.setEnabled(req.enabled());
        return mapper.toDto(userRepository.save(user));
    }

    public UserDto updateRoles(String tenantId, Long id, UpdateUserRolesRequest req) {
        StaffUser user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
        if (!tenantId.equals(user.getTenantId())) {
            throw new IllegalArgumentException("Tenant mismatch");
        }
        Set<StaffRole> newRoles = req.roleKeys().stream()
                .map(k -> roleRepository.findByTenantIdAndRoleKey(tenantId, k).orElseThrow(() -> new IllegalArgumentException("Role not found: " + k)))
                .collect(Collectors.toSet());
        user.setRoles(newRoles);
        return mapper.toDto(userRepository.save(user));
    }

    public void softDelete(String tenantId, Long id) {
        StaffUser user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Not found"));
        if (!tenantId.equals(user.getTenantId())) {
            throw new IllegalArgumentException("Tenant mismatch");
        }
        user.softDelete();
        userRepository.save(user);
    }
}
