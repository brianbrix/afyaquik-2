package com.afyaquik.hms.settings.domain;

import com.afyaquik.hms.common.domain.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

/**
 * System settings for tenant-specific configuration.
 * Each setting is identified by a unique key within a tenant.
 */
@Entity
@Table(name = "system_settings",
       indexes = {
           @Index(name = "idx_system_settings_tenant_key", columnList = "tenant_id,setting_key", unique = true)
       })
public class SystemSetting extends BaseEntity {

    @Column(name = "setting_key", nullable = false, length = 100)
    private String settingKey;

    @Column(name = "setting_value", length = 1000)
    private String settingValue;

    @Column(name = "default_value", length = 1000)
    private String defaultValue;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "setting_type", length = 50)
    private String settingType = "STRING"; // STRING, NUMBER, BOOLEAN, JSON

    @Column(name = "is_editable", nullable = false)
    private boolean isEditable = true;

    public SystemSetting() {}

    public SystemSetting(String settingKey, String settingValue, String defaultValue, String description, String settingType) {
        this.settingKey = settingKey;
        this.settingValue = settingValue;
        this.defaultValue = defaultValue;
        this.description = description;
        this.settingType = settingType;
    }

    // Getters and Setters
    public String getSettingKey() {
        return settingKey;
    }

    public void setSettingKey(String settingKey) {
        this.settingKey = settingKey;
    }

    public String getSettingValue() {
        return settingValue;
    }

    public void setSettingValue(String settingValue) {
        this.settingValue = settingValue;
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSettingType() {
        return settingType;
    }

    public void setSettingType(String settingType) {
        this.settingType = settingType;
    }

    public boolean isEditable() {
        return isEditable;
    }

    public void setEditable(boolean isEditable) {
        this.isEditable = isEditable;
    }

    /**
     * Get the effective value (setting value if set, otherwise default value)
     */
    public String getEffectiveValue() {
        return settingValue != null ? settingValue : defaultValue;
    }
}
