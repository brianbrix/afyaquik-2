package com.afyaquik.hms.auth.dto;

import java.time.LocalDateTime;

public record SuperAdminUserDto(
    Long id,
    String username,
    String displayName,
    String email,
    Boolean isActive,
    LocalDateTime lastLoginAt,
    String lastLoginIp,
    Integer failedLoginAttempts,
    LocalDateTime lockedUntil,
    String notes,
    String createdAt,
    String updatedAt
) {}
