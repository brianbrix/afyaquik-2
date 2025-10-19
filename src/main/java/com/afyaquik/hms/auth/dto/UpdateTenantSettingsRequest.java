package com.afyaquik.hms.auth.dto;

public record UpdateTenantSettingsRequest(
    Boolean isActive,
    Integer maxUsers,
    String subscriptionPlan
) {}
