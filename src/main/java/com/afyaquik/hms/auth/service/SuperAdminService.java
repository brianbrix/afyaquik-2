package com.afyaquik.hms.auth.service;

import com.afyaquik.hms.auth.domain.SuperAdminUser;
import com.afyaquik.hms.auth.domain.SuperAdminRole;
import com.afyaquik.hms.auth.repository.SuperAdminUserRepository;
import com.afyaquik.hms.auth.repository.SuperAdminRoleRepository;
import com.afyaquik.hms.common.web.TenantHeaderInterceptor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SuperAdminService {

    private final SuperAdminUserRepository superAdminUserRepository;
    private final SuperAdminRoleRepository superAdminRoleRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Check if a user has super admin access
     */
    public boolean isSuperAdmin(String username) {
        return superAdminUserRepository.findByUsername(username)
                .map(SuperAdminUser::getIsActive)
                .orElse(false);
    }

    /**
     * Get super admin user by username
     */
    public Optional<SuperAdminUser> getSuperAdminUser(String username) {
        return superAdminUserRepository.findByUsername(username);
    }

    /**
     * Create a new super admin user
     */
    @Transactional
    public SuperAdminUser createSuperAdminUser(String username, String displayName, 
                                              String email, String password) {
        if (superAdminUserRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Super admin username already exists");
        }
        
        if (superAdminUserRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Super admin email already exists");
        }

        SuperAdminUser user = new SuperAdminUser();
        user.setUsername(username);
        user.setDisplayName(displayName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setIsActive(true);

        return superAdminUserRepository.save(user);
    }

    /**
     * Update super admin user
     */
    @Transactional
    public SuperAdminUser updateSuperAdminUser(Long id, String displayName, String email, 
                                              String password, Boolean isActive) {
        SuperAdminUser user = superAdminUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Super admin user not found"));

        user.setDisplayName(displayName);
        user.setEmail(email);
        if (password != null && !password.trim().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(password));
        }
        user.setIsActive(isActive);

        return superAdminUserRepository.save(user);
    }

    /**
     * Get all super admin users
     */
    public List<SuperAdminUser> getAllSuperAdminUsers() {
        return superAdminUserRepository.findAll();
    }

    /**
     * Get active super admin users
     */
    public List<SuperAdminUser> getActiveSuperAdminUsers() {
        return superAdminUserRepository.findByIsActiveTrue();
    }

    /**
     * Deactivate super admin user
     */
    @Transactional
    public void deactivateSuperAdminUser(Long id) {
        SuperAdminUser user = superAdminUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Super admin user not found"));
        
        user.setIsActive(false);
        superAdminUserRepository.save(user);
    }

    /**
     * Update last login information
     */
    @Transactional
    public void updateLastLogin(String username, String ipAddress) {
        superAdminUserRepository.findByUsername(username).ifPresent(user -> {
            user.setLastLoginAt(LocalDateTime.now());
            user.setLastLoginIp(ipAddress);
            user.resetFailedAttempts();
            superAdminUserRepository.save(user);
        });
    }

    /**
     * Increment failed login attempts
     */
    @Transactional
    public void incrementFailedAttempts(String username) {
        superAdminUserRepository.findByUsername(username).ifPresent(user -> {
            user.incrementFailedAttempts();
            // Lock account after 5 failed attempts for 30 minutes
            if (user.getFailedLoginAttempts() >= 5) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(30));
            }
            superAdminUserRepository.save(user);
        });
    }


    /**
     * Check if current user is super admin
     */
    public boolean isCurrentUserSuperAdmin() {
        // This would need to be implemented based on your authentication context
        // For now, we'll use a simple check
        return false; // TODO: Implement based on current authentication context
    }
}
