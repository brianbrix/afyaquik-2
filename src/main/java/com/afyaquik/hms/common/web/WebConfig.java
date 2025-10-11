package com.afyaquik.hms.common.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.lang.NonNull;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final TenantHeaderInterceptor tenantHeaderInterceptor;

    @Autowired
    public WebConfig(TenantHeaderInterceptor tenantHeaderInterceptor) {
        this.tenantHeaderInterceptor = tenantHeaderInterceptor;
    }

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(tenantHeaderInterceptor).addPathPatterns("/**");
    }
}
