package com.afyaquik.hms.configuration.domain;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "role_redirect_url")
public class RoleRedirectUrl implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false, length = 64)
    private String tenantId;

    @Column(name = "role_key", nullable = false, length = 64)
    private String roleKey;

    @Column(name = "redirect_url", nullable = false, length = 256)
    private String redirectUrl;

    public RoleRedirectUrl() {}

    public RoleRedirectUrl(String tenantId, String roleKey, String redirectUrl) {
        this.tenantId = tenantId;
        this.roleKey = roleKey;
        this.redirectUrl = redirectUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getRoleKey() { return roleKey; }
    public void setRoleKey(String roleKey) { this.roleKey = roleKey; }

    public String getRedirectUrl() { return redirectUrl; }
    public void setRedirectUrl(String redirectUrl) { this.redirectUrl = redirectUrl; }
}
