package com.afyaquik.hms.common.web;

import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

public final class TenantHeaderResolver {

    public static final String TENANT_HEADER = "X-Tenant-Id";

    private TenantHeaderResolver() {
    }

    public static String resolveTenantId(String headerValue) {
        if (!StringUtils.hasText(headerValue)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "X-Tenant-Id header is required");
        }
        return headerValue.trim();
    }
}
