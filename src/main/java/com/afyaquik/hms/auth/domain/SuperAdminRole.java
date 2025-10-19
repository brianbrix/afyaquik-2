package com.afyaquik.hms.auth.domain;

import com.afyaquik.hms.common.domain.SuperAdminBaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Super Admin role that has elevated privileges across all tenants
 * This role is not tenant-specific and has system-wide access
 */
@Entity
@Table(name = "super_admin_roles", uniqueConstraints = {
        @UniqueConstraint(name = "uk_super_admin_role_key", columnNames = {"role_key"})
})
public class SuperAdminRole extends SuperAdminBaseEntity {

    @Column(name = "role_key", nullable = false, length = 64, unique = true)
    private String roleKey;

    @Column(name = "display_name", nullable = false, length = 128)
    private String displayName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_system_role", nullable = false)
    private Boolean isSystemRole = true;

    public SuperAdminRole() {}

    public SuperAdminRole(String roleKey, String displayName, String description) {
        this.roleKey = roleKey;
        this.displayName = displayName;
        this.description = description;
        this.isSystemRole = true;
    }

    public String getRoleKey() {
        return roleKey;
    }

    public void setRoleKey(String roleKey) {
        this.roleKey = roleKey == null ? null : roleKey.toUpperCase();
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsSystemRole() {
        return isSystemRole;
    }

    public void setIsSystemRole(Boolean isSystemRole) {
        this.isSystemRole = isSystemRole;
    }
}
