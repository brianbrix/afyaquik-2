package com.afyaquik.hms.auth.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.afyaquik.hms.auth.domain.StaffRole;
import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.domain.Tenant;
import com.afyaquik.hms.auth.dto.LoginRequest;
import com.afyaquik.hms.auth.dto.LoginResponse;
import com.afyaquik.hms.auth.dto.TokenRefreshResponse;
import com.afyaquik.hms.auth.dto.UserProfileDto;
import com.afyaquik.hms.auth.jwt.JwtPrincipal;
import com.afyaquik.hms.auth.jwt.JwtService;
import com.afyaquik.hms.auth.jwt.TokenType;
import com.afyaquik.hms.auth.repository.TenantRepository;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final StaffUserService staffUserService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final TenantRepository tenantRepository;

    public AuthService(StaffUserService staffUserService, JwtService jwtService, PasswordEncoder passwordEncoder, TenantRepository tenantRepository) {
        this.staffUserService = staffUserService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.tenantRepository = tenantRepository;
    }

    public LoginResponse login(String tenantId, LoginRequest request) {
        log.info("Login attempt for tenant={} username={}", tenantId, request.username());
        
        // Check if tenant is active
        Tenant tenant = tenantRepository.findByTenantCode(tenantId)
                .orElseThrow(() -> {
                    log.warn("Login failed: tenant not found for tenant={}", tenantId);
                    return new BadCredentialsException("Invalid tenant");
                });
        
        if (!tenant.getIsActive()) {
            log.warn("Login failed: tenant is inactive for tenant={}", tenantId);
            throw new BadCredentialsException("Tenant account is inactive. Please contact support.");
        }
        
        StaffUser user = staffUserService
                .findByTenantAndUsername(tenantId, request.username())
                .filter(StaffUser::isEnabled)
                .orElseThrow(() -> {
                    log.warn("Login failed: user not found or disabled for tenant={} username={}", tenantId, request.username());
                    return new BadCredentialsException("Invalid username or password");
                });

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            log.warn("Login failed: bad password for tenant={} username={}", tenantId, request.username());
            throw new BadCredentialsException("Invalid username or password");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        log.info("Login success for tenant={} username={}", tenantId, request.username());
        return new LoginResponse(
                accessToken,
                jwtService.getAccessTokenTtlSeconds(),
                refreshToken,
                jwtService.getRefreshTokenTtlSeconds(),
                toDto(user));
    }

    public TokenRefreshResponse refresh(String tenantId, String refreshToken) {
        log.info("Token refresh attempt for tenant={}", tenantId);
        JwtPrincipal principal = jwtService.parseToken(refreshToken, TokenType.REFRESH);
        if (!tenantId.equals(principal.tenantId())) {
            log.warn("Token refresh failed: tenant mismatch");
            throw new BadCredentialsException("Invalid refresh token for tenant");
        }

        StaffUser user = staffUserService
                .findById(principal.userId())
                .filter(StaffUser::isEnabled)
                .orElseThrow(() -> {
                    log.warn("Token refresh failed: user not found or disabled");
                    return new BadCredentialsException("User no longer available");
                });

        String accessToken = jwtService.generateAccessToken(user);
        log.info("Token refresh success for tenant={} username={}", tenantId, user.getUsername());
        return new TokenRefreshResponse(accessToken, jwtService.getAccessTokenTtlSeconds());
    }

    public UserProfileDto toDto(StaffUser user) {
        log.debug("Mapping StaffUser to UserProfileDto for userId={}", user.getId());
        List<String> roles = user.getRoles().stream()
            .map(StaffRole::getRoleKey)
            .map(k -> k == null ? null : k.toUpperCase())
            .sorted()
            .toList();
        return new UserProfileDto(user.getId(), user.getUsername(), user.getDisplayName(), user.getTenantId(), roles);
    }
}
