package com.afyaquik.hms.configuration.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "tenant_themes")
public class TenantTheme extends BaseEntity {

    @Column(name = "primary_color", length = 16)
    private String primaryColor;

    @Column(name = "logo_url", length = 256)
    private String logoUrl;

    @Column(name = "updated_by", length = 64)
    private String updatedBy; // username/id of last modifier

    public String getPrimaryColor() { return primaryColor; }
    public void setPrimaryColor(String primaryColor) { this.primaryColor = primaryColor; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
