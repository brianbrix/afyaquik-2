package com.afyaquik.hms.auth.api;

import com.afyaquik.hms.auth.dto.SuperAdminLoginRequest;
import com.afyaquik.hms.auth.dto.SuperAdminLoginResponse;
import com.afyaquik.hms.auth.dto.SuperAdminUserDto;
import com.afyaquik.hms.auth.service.SuperAdminAuthService;
import com.afyaquik.hms.common.web.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/super-admin/auth")
@RequiredArgsConstructor
@Slf4j
public class SuperAdminAuthController {

    private final SuperAdminAuthService superAdminAuthService;

    /**
     * Super Admin login endpoint
     * This is separate from regular tenant-based authentication
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<SuperAdminLoginResponse>> login(
            @Valid @RequestBody SuperAdminLoginRequest request,
            HttpServletRequest httpRequest) {
        try {
            String clientIp = getClientIpAddress(httpRequest);
            SuperAdminLoginResponse response = superAdminAuthService.login(request, clientIp);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Super admin login failed for username: {}", request.username(), e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Login failed: " + e.getMessage()));
        }
    }

    /**
     * Get current super admin user profile
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<SuperAdminUserDto>> me() {
        try {
            // This would need to be implemented based on current authentication context
            // For now, return a placeholder response
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            log.error("Error fetching super admin profile", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to fetch profile: " + e.getMessage()));
        }
    }

    /**
     * Super Admin logout (client-side token removal)
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // Super admin logout is handled client-side by removing tokens
        // No server-side session to invalidate
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * Extract client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
