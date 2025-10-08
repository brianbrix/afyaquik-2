package com.afyaquik.hms.auth.dto;

public record LoginResponse(
        String accessToken,
        long accessTokenExpiresIn,
        String refreshToken,
        long refreshTokenExpiresIn,
        UserProfileDto user) {
}
