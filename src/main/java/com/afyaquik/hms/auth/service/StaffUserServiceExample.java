package com.afyaquik.hms.auth.service;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.repository.StaffUserRepositoryExample;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Example service showing how to use tenant-aware repositories.
 * Notice how we don't need to pass tenantId explicitly anymore!
 */
@Service
@Transactional(readOnly = true)
public class StaffUserServiceExample {

    private final StaffUserRepositoryExample staffUserRepository;

    public StaffUserServiceExample(StaffUserRepositoryExample staffUserRepository) {
        this.staffUserRepository = staffUserRepository;
    }

    /**
     * Get all staff users for the current tenant.
     * No need to pass tenantId - it's handled automatically!
     */
    public List<StaffUser> getAllStaffUsers() {
        return staffUserRepository.findAllForCurrentTenant();
    }

    /**
     * Get staff user by ID for the current tenant.
     * Automatically filtered by tenant context.
     */
    public Optional<StaffUser> getStaffUserById(Long id) {
        return staffUserRepository.findByIdForCurrentTenant(id);
    }

    /**
     * Check if staff user exists for the current tenant.
     * Automatically filtered by tenant context.
     */
    public boolean staffUserExists(Long id) {
        return staffUserRepository.existsByIdForCurrentTenant(id);
    }

    /**
     * Get staff user by username for the current tenant.
     * Uses the tenant-aware method.
     */
    public Optional<StaffUser> getStaffUserByUsername(String username) {
        return staffUserRepository.findByUsernameForCurrentTenant(username);
    }

    /**
     * Get staff user by username (deleted=false) for the current tenant.
     * Uses the tenant-aware method.
     */
    public StaffUser getStaffUserByUsernameAndNotDeleted(String username) {
        return staffUserRepository.findByUsernameAndDeletedFalseForCurrentTenant(username);
    }

    /**
     * Count staff users for the current tenant.
     * Automatically filtered by tenant context.
     */
    public long getStaffUserCount() {
        return staffUserRepository.countForCurrentTenant();
    }

    /**
     * Delete staff user for the current tenant.
     * Automatically filtered by tenant context.
     */
    @Transactional
    public void deleteStaffUser(Long id) {
        staffUserRepository.deleteByIdForCurrentTenant(id);
    }

    /**
     * Delete all staff users for the current tenant.
     * Automatically filtered by tenant context.
     */
    @Transactional
    public void deleteAllStaffUsers() {
        staffUserRepository.deleteAllForCurrentTenant();
    }
}
