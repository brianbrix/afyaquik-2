package com.afyaquik.hms.auth.dto;

import java.time.LocalDateTime;

public record TenantDto(
    Long id,
    String tenantCode,
    String tenantName,
    String description,
    String contactEmail,
    String contactPhone,
    String address,
    String city,
    String state,
    String country,
    Boolean isActive,
    String subscriptionPlan,
    Integer maxUsers,
    LocalDateTime trialEndsAt,
    String settings,
    String createdAt,
    String updatedAt
) {}
