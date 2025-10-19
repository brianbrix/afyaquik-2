package com.afyaquik.hms.admin.dto;

import java.util.Set;

public record UserDto(Long id, String username, String displayName, String email, boolean enabled, Set<RoleDto> roles, Long supervisorId, String supervisorDisplayName, boolean isTenantSuperAdmin) {}
