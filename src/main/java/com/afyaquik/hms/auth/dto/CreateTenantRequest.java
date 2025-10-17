package com.afyaquik.hms.auth.dto;

public record CreateTenantRequest(
    String tenantCode,
    String tenantName,
    String description,
    String contactEmail,
    String contactPhone,
    String address,
    String city,
    String state,
    String country,
    String subscriptionPlan,
    Integer maxUsers,
    Integer trialDays
) {}
