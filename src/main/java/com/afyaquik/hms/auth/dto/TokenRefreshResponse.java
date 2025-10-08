package com.afyaquik.hms.auth.dto;

public record TokenRefreshResponse(String accessToken, long accessTokenExpiresIn) {
}
