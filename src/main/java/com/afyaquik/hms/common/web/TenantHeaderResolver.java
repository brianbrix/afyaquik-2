package com.afyaquik.hms.common.web;

import org.springframework.util.StringUtils;

public final class TenantHeaderResolver {

    public static final String TENANT_HEADER = "X-Tenant-Id";

    private TenantHeaderResolver() {
    }

    public static String resolveTenantId(String headerValue) {
        if (!StringUtils.hasText(headerValue)) {
            return null; // allow anonymous endpoints to proceed; secured controllers will enforce
        }
        return headerValue.trim();
    }
}
