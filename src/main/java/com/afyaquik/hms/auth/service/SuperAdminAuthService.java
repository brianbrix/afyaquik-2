package com.afyaquik.hms.auth.service;

import java.time.LocalDateTime;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.afyaquik.hms.auth.domain.SuperAdminUser;
import com.afyaquik.hms.auth.dto.SuperAdminLoginRequest;
import com.afyaquik.hms.auth.dto.SuperAdminLoginResponse;
import com.afyaquik.hms.auth.dto.SuperAdminRefreshRequest;
import com.afyaquik.hms.auth.dto.SuperAdminRefreshResponse;
import com.afyaquik.hms.auth.dto.SuperAdminUserDto;
import com.afyaquik.hms.auth.jwt.JwtPrincipal;
import com.afyaquik.hms.auth.jwt.JwtService;
import com.afyaquik.hms.auth.jwt.TokenType;
import com.afyaquik.hms.auth.repository.SuperAdminUserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SuperAdminAuthService {

    private final SuperAdminUserRepository superAdminUserRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Authenticate super admin user
     */
    public SuperAdminLoginResponse login(SuperAdminLoginRequest request, String clientIp) {
        log.info("Super admin login attempt for username: {}", request.username());
        
        SuperAdminUser user = superAdminUserRepository.findByUsername(request.username())
                .orElseThrow(() -> {
                    log.warn("Super admin login failed: user not found for username: {}", request.username());
                    return new BadCredentialsException("Invalid username or password");
                });

        // Check if account is locked
        if (user.isLocked()) {
            log.warn("Super admin login failed: account locked for username: {}", request.username());
            throw new BadCredentialsException("Account is locked. Please try again later.");
        }

        // Check if account is active
        if (!user.getIsActive()) {
            log.warn("Super admin login failed: account inactive for username: {}", request.username());
            throw new BadCredentialsException("Account is inactive");
        }

        // Verify password
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            log.warn("Super admin login failed: bad password for username: {}", request.username());
            incrementFailedAttempts(user);
            throw new BadCredentialsException("Invalid username or password");
        }

        // Reset failed attempts on successful login
        user.resetFailedAttempts();
        user.setLastLoginAt(LocalDateTime.now());
        user.setLastLoginIp(clientIp);
        superAdminUserRepository.save(user);

        // Generate tokens
        String accessToken = jwtService.generateSuperAdminAccessToken(user);
        String refreshToken = jwtService.generateSuperAdminRefreshToken(user);

        log.info("Super admin login successful for username: {}", request.username());
        
        return new SuperAdminLoginResponse(
                accessToken,
                (int) jwtService.getAccessTokenTtlSeconds(),
                refreshToken,
                (int) jwtService.getRefreshTokenTtlSeconds(),
                toDto(user)
        );
    }

    /**
     * Increment failed login attempts and lock account if necessary
     */
    private void incrementFailedAttempts(SuperAdminUser user) {
        user.incrementFailedAttempts();
        superAdminUserRepository.save(user);
        
        if (user.getFailedLoginAttempts() >= 5) {
            log.warn("Super admin account locked due to too many failed attempts: {}", user.getUsername());
        }
    }

    /**
     * Refresh super admin access token
     */
    public SuperAdminRefreshResponse refresh(SuperAdminRefreshRequest request) {
        log.info("Super admin token refresh attempt");
        
        JwtPrincipal principal = jwtService.parseToken(request.refreshToken(), TokenType.REFRESH);
        
        SuperAdminUser user = superAdminUserRepository.findById(principal.userId())
                .filter(SuperAdminUser::getIsActive)
                .orElseThrow(() -> {
                    log.warn("Super admin token refresh failed: user not found or inactive");
                    return new BadCredentialsException("User no longer available");
                });

        // Check if account is locked
        if (user.isLocked()) {
            log.warn("Super admin token refresh failed: account locked");
            throw new BadCredentialsException("Account is locked");
        }

        String accessToken = jwtService.generateSuperAdminAccessToken(user);
        
        log.info("Super admin token refresh successful for username: {}", user.getUsername());
        
        return new SuperAdminRefreshResponse(
                accessToken,
                (int) jwtService.getAccessTokenTtlSeconds()
        );
    }

    /**
     * Convert SuperAdminUser to DTO
     */
    public SuperAdminUserDto toDto(SuperAdminUser user) {
        return new SuperAdminUserDto(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getEmail(),
                user.getIsActive(),
                user.getLastLoginAt(),
                user.getLastLoginIp(),
                user.getFailedLoginAttempts(),
                user.getLockedUntil(),
                user.getNotes(),
                user.getCreatedAt().toString(),
                user.getUpdatedAt().toString()
        );
    }
}
