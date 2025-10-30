package com.afyaquik.hms.auth.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.afyaquik.hms.common.tenant.TenantContextFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final TenantRequestValidationFilter tenantRequestValidationFilter;
    private final TenantContextFilter tenantContextFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          TenantRequestValidationFilter tenantRequestValidationFilter,
                          TenantContextFilter tenantContextFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.tenantRequestValidationFilter = tenantRequestValidationFilter;
        this.tenantContextFilter = tenantContextFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            // Super admin login and refresh must be first and most specific
            .requestMatchers("/api/v1/super-admin/auth/login", "/api/v1/super-admin/auth/refresh").permitAll()
            // Regular auth endpoints
            .requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/auth/refresh").permitAll()
            .requestMatchers(HttpMethod.GET, "/actuator/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/v1/settings ").permitAll()
            // Allow websocket handshake + SockJS info/endpoints (authentication will be enforced at message level if needed)
            .requestMatchers("/ws/**").permitAll()
            // Offline/snapshot endpoints removed
                .requestMatchers("/api/v1/triage/items/test").permitAll()
                .requestMatchers("/api/v1/triage/**").authenticated()
                .requestMatchers(HttpMethod.GET,"/api/v1/admin/triage-titles**").authenticated()
                .requestMatchers(HttpMethod.GET,"/api/v1/admin/consultation-titles/**").authenticated()
                .requestMatchers(HttpMethod.GET,"/api/v1/admin/queue-status-role-matrix**").authenticated()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                // Super admin endpoints - require SUPER_ADMIN role (but exclude login which is already permitted above)
                .requestMatchers("/api/v1/super-admin/users/**").hasRole("SUPER_ADMIN")
                .requestMatchers("/api/v1/super-admin/tenants/**").hasRole("SUPER_ADMIN")
                .requestMatchers("/api/v1/super-admin/health/**").hasRole("SUPER_ADMIN")
                .requestMatchers("/api/v1/super-admin/auth/me").hasRole("SUPER_ADMIN")
                // Allow any authenticated user to access queue endpoints
            .requestMatchers("/api/v1/queue/**").authenticated()
            // Allow unauthenticated access to theme (branding on login page); keep features authenticated
            .requestMatchers(HttpMethod.GET, "/api/v1/config/theme").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/v1/config/features").authenticated()
            // Allow any authenticated user to get role redirects
            .requestMatchers(HttpMethod.GET, "/api/v1/config/role-redirects", "/api/v1/config/role-redirects/**").authenticated()
            // Staff directory (assignment UI) - authenticated users
            .requestMatchers(HttpMethod.GET, "/api/v1/directory/staff").authenticated()
            // Allow authenticated access to reference data endpoints
            .requestMatchers(HttpMethod.GET, "/api/v1/reference/roles", "/api/v1/reference/departments").authenticated()
            // Scheduling endpoints secured via method security, but allow them through general matcher set
            .requestMatchers(HttpMethod.GET, "/api/v1/scheduling/**").authenticated()
            // All other config modifications remain admin only
            .requestMatchers("/api/v1/config/**").hasRole("ADMIN")
            .anyRequest().authenticated())
                .addFilterBefore(tenantContextFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(tenantRequestValidationFilter, JwtAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Allow localhost for development
        config.addAllowedOriginPattern("http://localhost:5173");
        config.addAllowedOriginPattern("http://localhost:8081");
        config.addAllowedOriginPattern("http://localhost:8080");
        // Allow production IP
        config.addAllowedOriginPattern("http://152.53.164.124:8081");
        // Allow any origin for development (be more restrictive in production)
        config.addAllowedOriginPattern("*");
        config.setAllowCredentials(true);
        config.addAllowedHeader("*");
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("PATCH");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Content-Type");
        config.addExposedHeader("X-Tenant-Id");
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public MethodSecurityExpressionHandler methodSecurityExpressionHandler(CustomPermissionEvaluator permissionEvaluator) {
        DefaultMethodSecurityExpressionHandler handler = new DefaultMethodSecurityExpressionHandler();
        handler.setPermissionEvaluator(permissionEvaluator);
        return handler;
    }
}
