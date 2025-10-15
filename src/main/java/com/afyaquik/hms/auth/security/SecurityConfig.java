package com.afyaquik.hms.auth.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
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
            .requestMatchers(HttpMethod.POST, "/api/v1/auth/login", "/api/v1/auth/refresh").permitAll()
            .requestMatchers(HttpMethod.GET, "/actuator/**").permitAll()
            // Allow websocket handshake + SockJS info/endpoints (authentication will be enforced at message level if needed)
            .requestMatchers("/ws/**").permitAll()
                .requestMatchers(HttpMethod.GET,"/api/v1/admin/triage-titles**").authenticated()
                .requestMatchers(HttpMethod.GET,"/api/v1/admin/consultation-titles/**").authenticated()
                .requestMatchers(HttpMethod.GET,"/api/v1/admin/queue-status-role-matrix**").authenticated()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
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
        config.addAllowedOriginPattern("http://localhost:5173");
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
