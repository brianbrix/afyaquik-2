package com.afyaquik.hms.configuration.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "feature_flags", uniqueConstraints = {
        @UniqueConstraint(name = "uk_feature_flag_tenant_key", columnNames = {"tenant_id", "flag_key"})
})
public class FeatureFlag extends BaseEntity {

    @Column(name = "flag_key", nullable = false, length = 64)
    private String flagKey;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = false;

    @Column(name = "description", length = 256)
    private String description;

    public String getFlagKey() { return flagKey; }
    public void setFlagKey(String flagKey) { this.flagKey = flagKey; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
