package com.afyaquik.hms.audit.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.afyaquik.hms.audit.interceptor.AnnotationBasedAuditInterceptor;

import lombok.RequiredArgsConstructor;

/**
 * Configuration for annotation-based audit logging.
 */
@Configuration
@EnableAsync
@RequiredArgsConstructor
public class AuditConfig implements WebMvcConfigurer {

    private final AnnotationBasedAuditInterceptor annotationBasedAuditInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(annotationBasedAuditInterceptor)
                .addPathPatterns("/api/v1/**", "/super-admin/**")
                .excludePathPatterns(
                    "/api/v1/auth/login",
                    "/api/v1/auth/refresh", 
                    "/api/v1/auth/logout",
                    "/api/v1/super-admin/auth/login",
                    "/api/v1/super-admin/auth/refresh",
                    "/api/v1/super-admin/auth/logout",
                    "/actuator/**",
                    "/health",
                    "/error"
                );
    }
}
