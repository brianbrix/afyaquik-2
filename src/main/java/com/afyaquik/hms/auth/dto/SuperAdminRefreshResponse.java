package com.afyaquik.hms.auth.dto;

public record SuperAdminRefreshResponse(
    String accessToken,
    int expiresIn
) {}
