package com.afyaquik.hms.auth.domain;

import com.afyaquik.hms.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Tenant entity representing a clinic or organization
 * Each tenant has its own isolated data and users
 */
@Entity
@Table(name = "tenants", uniqueConstraints = {
        @UniqueConstraint(name = "uk_tenant_code", columnNames = {"tenant_code"})
})
public class Tenant extends BaseEntity {

    @Column(name = "tenant_code", nullable = false, unique = true, length = 64)
    private String tenantCode;

    @Column(name = "tenant_name", nullable = false, length = 128)
    private String tenantName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "contact_email", length = 128)
    private String contactEmail;

    @Column(name = "contact_phone", length = 32)
    private String contactPhone;

    @Column(name = "address", length = 256)
    private String address;

    @Column(name = "city", length = 64)
    private String city;

    @Column(name = "state", length = 64)
    private String state;

    @Column(name = "country", length = 64)
    private String country;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "subscription_plan", length = 32)
    private String subscriptionPlan;

    @Column(name = "max_users")
    private Integer maxUsers;

    @Column(name = "trial_ends_at")
    private LocalDateTime trialEndsAt;

    @Column(name = "settings", columnDefinition = "TEXT")
    private String settings; // JSON string for tenant-specific settings

    public Tenant() {}

    public Tenant(String tenantCode, String tenantName, String description) {
        this.tenantCode = tenantCode;
        this.tenantName = tenantName;
        this.description = description;
        this.isActive = true;
    }

    // Getters and setters
    public String getTenantCode() {
        return tenantCode;
    }

    public void setTenantCode(String tenantCode) {
        this.tenantCode = tenantCode;
    }

    public String getTenantName() {
        return tenantName;
    }

    public void setTenantName(String tenantName) {
        this.tenantName = tenantName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getSubscriptionPlan() {
        return subscriptionPlan;
    }

    public void setSubscriptionPlan(String subscriptionPlan) {
        this.subscriptionPlan = subscriptionPlan;
    }

    public Integer getMaxUsers() {
        return maxUsers;
    }

    public void setMaxUsers(Integer maxUsers) {
        this.maxUsers = maxUsers;
    }

    public LocalDateTime getTrialEndsAt() {
        return trialEndsAt;
    }

    public void setTrialEndsAt(LocalDateTime trialEndsAt) {
        this.trialEndsAt = trialEndsAt;
    }

    public String getSettings() {
        return settings;
    }

    public void setSettings(String settings) {
        this.settings = settings;
    }

    public boolean isTrialExpired() {
        return trialEndsAt != null && trialEndsAt.isBefore(LocalDateTime.now());
    }
}
