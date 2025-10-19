package com.afyaquik.hms.auth.dto;

public record UpdateTenantRequest(
    String tenantName,
    String description,
    String contactEmail,
    String contactPhone,
    String address,
    String city,
    String state,
    String country
) {}
