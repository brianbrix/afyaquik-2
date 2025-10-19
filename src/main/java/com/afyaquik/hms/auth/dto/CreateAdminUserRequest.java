package com.afyaquik.hms.auth.dto;

public record CreateAdminUserRequest(
    String username,
    String displayName,
    String email,
    String password,
    String tenantCode,
    String roleKey,
    String department,
    String phone,
    String notes,
    boolean isTenantSuperAdmin
) {}
