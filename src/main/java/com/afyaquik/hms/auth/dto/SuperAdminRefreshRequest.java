package com.afyaquik.hms.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record SuperAdminRefreshRequest(
    @NotBlank(message = "Refresh token is required")
    String refreshToken
) {}
