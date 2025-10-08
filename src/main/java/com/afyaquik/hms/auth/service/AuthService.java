package com.afyaquik.hms.auth.service;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.dto.LoginRequest;
import com.afyaquik.hms.auth.dto.LoginResponse;
import com.afyaquik.hms.auth.dto.TokenRefreshResponse;
import com.afyaquik.hms.auth.dto.UserProfileDto;
import com.afyaquik.hms.auth.jwt.JwtPrincipal;
import com.afyaquik.hms.auth.jwt.JwtService;
import com.afyaquik.hms.auth.jwt.TokenType;
import com.afyaquik.hms.auth.domain.StaffRole;
import java.util.List;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final StaffUserService staffUserService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(StaffUserService staffUserService, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.staffUserService = staffUserService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(String tenantId, LoginRequest request) {
        StaffUser user = staffUserService
                .findByTenantAndUsername(tenantId, request.username())
                .filter(StaffUser::isEnabled)
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new LoginResponse(
                accessToken,
                jwtService.getAccessTokenTtlSeconds(),
                refreshToken,
                jwtService.getRefreshTokenTtlSeconds(),
                toDto(user));
    }

    public TokenRefreshResponse refresh(String tenantId, String refreshToken) {
        JwtPrincipal principal = jwtService.parseToken(refreshToken, TokenType.REFRESH);
        if (!tenantId.equals(principal.tenantId())) {
            throw new BadCredentialsException("Invalid refresh token for tenant");
        }

        StaffUser user = staffUserService
                .findById(principal.userId())
                .filter(StaffUser::isEnabled)
                .orElseThrow(() -> new BadCredentialsException("User no longer available"));

        String accessToken = jwtService.generateAccessToken(user);
        return new TokenRefreshResponse(accessToken, jwtService.getAccessTokenTtlSeconds());
    }

    public UserProfileDto toDto(StaffUser user) {
    List<String> roles = user.getRoles().stream()
        .map(StaffRole::getRoleKey)
                .sorted()
                .toList();
        return new UserProfileDto(user.getId(), user.getUsername(), user.getDisplayName(), user.getTenantId(), roles);
    }
}
