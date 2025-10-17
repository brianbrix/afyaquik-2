package com.afyaquik.hms.auth.security;

import com.afyaquik.hms.auth.domain.StaffUser;
import com.afyaquik.hms.auth.domain.SuperAdminUser;
import com.afyaquik.hms.auth.jwt.JwtPrincipal;
import com.afyaquik.hms.auth.jwt.JwtService;
import com.afyaquik.hms.auth.jwt.JwtVerificationException;
import com.afyaquik.hms.auth.jwt.TokenType;
import com.afyaquik.hms.auth.service.StaffUserService;
import com.afyaquik.hms.auth.service.SuperAdminService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final StaffUserService staffUserService;
    private final SuperAdminService superAdminService;

    public JwtAuthenticationFilter(JwtService jwtService, StaffUserService staffUserService, @Lazy SuperAdminService superAdminService) {
        this.jwtService = jwtService;
        this.staffUserService = staffUserService;
        this.superAdminService = superAdminService;
    }

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(BEARER_PREFIX.length());
        try {
            JwtPrincipal principal = jwtService.parseToken(token, TokenType.ACCESS);
            
            // Check if this is a Super Admin token
            if (principal.isSuperAdmin()) {
                Optional<SuperAdminUser> superAdminOpt = superAdminService.getSuperAdminUser(principal.username());
                if (superAdminOpt.isEmpty()) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
                SuperAdminUser superAdmin = superAdminOpt.get();
                if (!superAdmin.getIsActive()) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
                SuperAdminUserDetails userDetails = new SuperAdminUserDetails(superAdmin);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                // Regular tenant-based authentication
                Optional<StaffUser> userOpt = staffUserService.findById(principal.userId());
                if (userOpt.isEmpty()) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
                StaffUser user = userOpt.get();
                if (!user.isEnabled()) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
                if (!user.getTenantId().equals(principal.tenantId())) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
                TenantUserDetails userDetails = new TenantUserDetails(user);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (JwtVerificationException ex) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
