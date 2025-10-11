package com.afyaquik.hms.auth.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "staff_roles", uniqueConstraints = {
        @UniqueConstraint(name = "uk_staff_role_tenant_key", columnNames = {"tenant_id", "role_key"})
})
public class StaffRole extends BaseEntity {

    @Column(name = "role_key", nullable = false, length = 64)
    private String roleKey;

    @Column(name = "display_name", nullable = false, length = 128)
    private String displayName;

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
}
