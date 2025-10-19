package com.afyaquik.hms.auth.security;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.afyaquik.hms.common.web.TenantHeaderResolver;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class TenantRequestValidationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        // Skip tenant validation for authentication endpoints
        if (isAuthEndpoint(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Only validate tenant for authenticated tenant users
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof TenantUserDetails principal) {
            String header = request.getHeader(TenantHeaderResolver.TENANT_HEADER);
            if (header != null && !header.isBlank()) {
                String tenantId = header.trim();
                if (!principal.getUser().getTenantId().equals(tenantId)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAuthEndpoint(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        return ("/api/v1/auth/login".equals(path) || 
                "/api/v1/auth/refresh".equals(path) || 
                "/api/v1/super-admin/auth/login".equals(path) ||
                "/api/v1/super-admin/auth/refresh".equals(path)) && "POST".equalsIgnoreCase(method);
    }
}
