package com.afyaquik.hms.auth.service;

import com.afyaquik.hms.auth.domain.Tenant;
import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.domain.StaffRole;
import com.afyaquik.hms.auth.repository.TenantRepository;
import com.afyaquik.hms.auth.repository.StaffUserRepository;
import com.afyaquik.hms.auth.repository.StaffRoleRepository;
import com.afyaquik.hms.auth.dto.TenantDto;
import com.afyaquik.hms.auth.dto.CreateTenantRequest;
import com.afyaquik.hms.auth.dto.CreateAdminUserRequest;
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
public class TenantManagementService {

    private final TenantRepository tenantRepository;
    private final StaffUserRepository staffUserRepository;
    private final StaffRoleRepository staffRoleRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Create a new tenant
     */
    @Transactional
    public Tenant createTenant(CreateTenantRequest request) {
        if (tenantRepository.existsByTenantCode(request.tenantCode())) {
            throw new IllegalArgumentException("Tenant code already exists: " + request.tenantCode());
        }

        Tenant tenant = new Tenant();
        tenant.setTenantCode(request.tenantCode());
        tenant.setTenantName(request.tenantName());
        tenant.setDescription(request.description());
        tenant.setContactEmail(request.contactEmail());
        tenant.setContactPhone(request.contactPhone());
        tenant.setAddress(request.address());
        tenant.setCity(request.city());
        tenant.setState(request.state());
        tenant.setCountry(request.country());
        tenant.setSubscriptionPlan(request.subscriptionPlan());
        tenant.setMaxUsers(request.maxUsers());
        tenant.setIsActive(true);

        // Set trial period if specified
        if (request.trialDays() != null && request.trialDays() > 0) {
            tenant.setTrialEndsAt(LocalDateTime.now().plusDays(request.trialDays()));
        }

        Tenant savedTenant = tenantRepository.save(tenant);
        log.info("Created new tenant: {} ({})", savedTenant.getTenantName(), savedTenant.getTenantCode());
        
        return savedTenant;
    }

    /**
     * Get all tenants
     */
    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    /**
     * Get active tenants
     */
    public List<Tenant> getActiveTenants() {
        return tenantRepository.findByIsActiveTrue();
    }

    /**
     * Get tenant by code
     */
    public Optional<Tenant> getTenantByCode(String tenantCode) {
        return tenantRepository.findByTenantCode(tenantCode);
    }

    /**
     * Update tenant
     */
    @Transactional
    public Tenant updateTenant(String tenantCode, CreateTenantRequest request) {
        Tenant tenant = tenantRepository.findByTenantCode(tenantCode)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantCode));

        tenant.setTenantName(request.tenantName());
        tenant.setDescription(request.description());
        tenant.setContactEmail(request.contactEmail());
        tenant.setContactPhone(request.contactPhone());
        tenant.setAddress(request.address());
        tenant.setCity(request.city());
        tenant.setState(request.state());
        tenant.setCountry(request.country());
        tenant.setSubscriptionPlan(request.subscriptionPlan());
        tenant.setMaxUsers(request.maxUsers());

        return tenantRepository.save(tenant);
    }

    /**
     * Deactivate tenant
     */
    @Transactional
    public void deactivateTenant(String tenantCode) {
        Tenant tenant = tenantRepository.findByTenantCode(tenantCode)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantCode));
        
        tenant.setIsActive(false);
        tenantRepository.save(tenant);
        log.info("Deactivated tenant: {} ({})", tenant.getTenantName(), tenant.getTenantCode());
    }

    /**
     * Create admin user for a specific tenant
     */
    @Transactional
    public StaffUser createAdminUser(CreateAdminUserRequest request) {
        // Verify tenant exists
        Tenant tenant = tenantRepository.findByTenantCode(request.tenantCode())
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + request.tenantCode()));

        // TODO: Add username and email uniqueness checks

        // Get or create the role
        StaffRole role = staffRoleRepository.findByTenantIdAndRoleKey(tenant.getTenantCode(), request.roleKey())
                .orElseGet(() -> {
                    StaffRole newRole = new StaffRole();
                    newRole.setTenantId(tenant.getTenantCode());
                    newRole.setRoleKey(request.roleKey());
                    newRole.setDisplayName(request.roleKey().replace("_", " "));
                    return staffRoleRepository.save(newRole);
                });

        // Create the user
        StaffUser user = new StaffUser();
        user.setTenantId(tenant.getTenantCode());
        user.setUsername(request.username());
        user.setDisplayName(request.displayName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        // TODO: Add department, phone, isActive, jobTitle, notes fields to StaffUser

        StaffUser savedUser = staffUserRepository.save(user);
        log.info("Created admin user {} for tenant {}", savedUser.getUsername(), tenant.getTenantCode());
        
        return savedUser;
    }

    /**
     * Get users for a specific tenant
     */
    public List<StaffUser> getUsersForTenant(String tenantCode) {
        return staffUserRepository.findByTenantId(tenantCode);
    }

    /**
     * Get tenant statistics
     */
    public TenantStats getTenantStats(String tenantCode) {
        Tenant tenant = tenantRepository.findByTenantCode(tenantCode)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantCode));

        long userCount = staffUserRepository.countByTenantId(tenantCode);
        long activeUserCount = staffUserRepository.countByTenantId(tenantCode); // TODO: Add countByTenantIdAndIsActiveTrue method

        return new TenantStats(
            tenant.getTenantName(),
            tenant.getTenantCode(),
            userCount,
            activeUserCount,
            tenant.getMaxUsers(),
            tenant.getIsActive(),
            tenant.getTrialEndsAt()
        );
    }

    /**
     * Convert Tenant to DTO
     */
    public TenantDto toDto(Tenant tenant) {
        return new TenantDto(
            tenant.getId(),
            tenant.getTenantCode(),
            tenant.getTenantName(),
            tenant.getDescription(),
            tenant.getContactEmail(),
            tenant.getContactPhone(),
            tenant.getAddress(),
            tenant.getCity(),
            tenant.getState(),
            tenant.getCountry(),
            tenant.getIsActive(),
            tenant.getSubscriptionPlan(),
            tenant.getMaxUsers(),
            tenant.getTrialEndsAt(),
            tenant.getSettings(),
            tenant.getCreatedAt().toString(),
            tenant.getUpdatedAt().toString()
        );
    }

    public record TenantStats(
        String tenantName,
        String tenantCode,
        long totalUsers,
        long activeUsers,
        Integer maxUsers,
        Boolean isActive,
        LocalDateTime trialEndsAt
    ) {}
}
