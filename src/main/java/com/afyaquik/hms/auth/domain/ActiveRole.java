package com.afyaquik.hms.auth.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "active_roles", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "user_id"}))
public class ActiveRole extends BaseEntity {
    
    @Column(nullable = false)
    private String tenantId;
    
    @Column(nullable = false)
    private Long userId;
    
    @Column(nullable = false)
    private String roleKey;
    
    @Column
    private String roleName;
    
    @Column
    private String roleDescription;

    public ActiveRole() {}

    public ActiveRole(String tenantId, Long userId, String roleKey, String roleName, String roleDescription) {
        this.tenantId = tenantId;
        this.userId = userId;
        this.roleKey = roleKey;
        this.roleName = roleName;
        this.roleDescription = roleDescription;
    }

    // Getters and setters
    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getRoleKey() {
        return roleKey;
    }

    public void setRoleKey(String roleKey) {
        this.roleKey = roleKey;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public String getRoleDescription() {
        return roleDescription;
    }

    public void setRoleDescription(String roleDescription) {
        this.roleDescription = roleDescription;
    }
}
