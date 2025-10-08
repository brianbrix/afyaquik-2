package com.afyaquik.hms.auth.dto;

import java.util.List;

public record UserProfileDto(
        Long id,
        String username,
        String displayName,
        String tenantId,
        List<String> roles) {
}
