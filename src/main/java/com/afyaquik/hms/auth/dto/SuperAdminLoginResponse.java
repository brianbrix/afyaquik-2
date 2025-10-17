package com.afyaquik.hms.auth.dto;

public record SuperAdminLoginResponse(
    String accessToken,
    int expiresIn,
    String refreshToken,
    int refreshExpiresIn,
    SuperAdminUserDto user
) {}
