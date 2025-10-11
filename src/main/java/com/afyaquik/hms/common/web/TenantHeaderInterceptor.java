package com.afyaquik.hms.common.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class TenantHeaderInterceptor implements HandlerInterceptor {
    public static final String TENANT_HEADER = "X-Tenant-Id";
    public static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) throws Exception {
        String tenantId = request.getHeader(TENANT_HEADER);
        if (tenantId == null || tenantId.trim().isEmpty()) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "X-Tenant-Id header is required");
            return false;
        }
        CURRENT_TENANT.set(tenantId.trim());
        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler, @Nullable Exception ex) throws Exception {
        CURRENT_TENANT.remove();
    }

    public static String getCurrentTenant() {
        return CURRENT_TENANT.get();
    }
}
