package com.afyaquik.hms.auth.api;

import com.afyaquik.hms.auth.dto.LoginRequest;
import com.afyaquik.hms.auth.dto.LoginResponse;
import com.afyaquik.hms.auth.dto.RefreshTokenRequest;
import com.afyaquik.hms.auth.dto.TokenRefreshResponse;
import com.afyaquik.hms.auth.dto.UserProfileDto;
import com.afyaquik.hms.common.web.ApiResponse;
import com.afyaquik.hms.auth.security.TenantUserDetails;
import com.afyaquik.hms.auth.service.AuthService;
import com.afyaquik.hms.common.web.TenantHeaderResolver;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @Valid @RequestBody LoginRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        if (tenantId == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "X-Tenant-Id header is required");
        }
        return ApiResponse.success(authService.login(tenantId, request));
    }

    @PostMapping("/refresh")
    public ApiResponse<TokenRefreshResponse> refresh(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            @Valid @RequestBody RefreshTokenRequest request) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        if (tenantId == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "X-Tenant-Id header is required");
        }
        return ApiResponse.success(authService.refresh(tenantId, request.refreshToken()));
    }

    @GetMapping("/me")
    public ApiResponse<UserProfileDto> me(
            @RequestHeader(value = TenantHeaderResolver.TENANT_HEADER, required = false) String tenantHeader,
            Authentication authentication) {
        String tenantId = TenantHeaderResolver.resolveTenantId(tenantHeader);
        if (tenantId == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "X-Tenant-Id header is required");
        }
        TenantUserDetails principal = (TenantUserDetails) authentication.getPrincipal();
        if (!principal.getUser().getTenantId().equals(tenantId)) {
            throw new org.springframework.security.access.AccessDeniedException("Tenant mismatch");
        }
        return ApiResponse.success(authService.toDto(principal.getUser()));
    }
}
