package com.afyaquik.hms.common.web;

import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

public final class UserHeaderResolver {

    public static final String USER_HEADER = "X-User-Id";

    private UserHeaderResolver() {
    }

    public static String resolveUserId(String headerValue) {
        if (!StringUtils.hasText(headerValue)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "X-User-Id header is required");
        }
        return headerValue.trim();
    }
}
