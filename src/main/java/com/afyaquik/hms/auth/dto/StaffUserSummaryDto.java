package com.afyaquik.hms.auth.dto;

import java.time.Instant;
import java.util.Set;

public record StaffUserSummaryDto(
    Long id,
    String username,
    String displayName,
    String email,
    boolean enabled,
    boolean isTenantSuperAdmin,
    Set<String> roles,
    Long supervisorId,
    String supervisorDisplayName,
    Instant createdAt,
    Instant updatedAt
) {}
