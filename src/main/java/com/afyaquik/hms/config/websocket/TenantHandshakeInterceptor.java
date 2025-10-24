package com.afyaquik.hms.config.websocket;

import java.security.Principal;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.afyaquik.hms.common.web.TenantHeaderResolver;

import jakarta.servlet.http.HttpSession;

/**
 * Captures tenant id & principal at handshake time so we can route messages per tenant.
 */
@Component
public class TenantHandshakeInterceptor implements HandshakeInterceptor {

    private static final Logger log = LoggerFactory.getLogger(TenantHandshakeInterceptor.class);

    @Override
    public boolean beforeHandshake(@NonNull ServerHttpRequest request,
                                   @NonNull ServerHttpResponse response,
                                   @NonNull WebSocketHandler wsHandler,
                                   @NonNull Map<String, Object> attributes) {
        if (request instanceof ServletServerHttpRequest servlet) {
            var servletRequest = servlet.getServletRequest();
            
            // Log all headers for debugging
            log.info("WebSocket handshake - Request URI: {}", servletRequest.getRequestURI());
            log.info("WebSocket handshake - Query String: {}", servletRequest.getQueryString());
            
            // Log all headers to see what's being sent
            var headerNames = servletRequest.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                String headerValue = servletRequest.getHeader(headerName);
                log.info("WebSocket handshake - Header: {} = {}", headerName, headerValue);
            }
            
            String tenant = servletRequest.getHeader(TenantHeaderResolver.TENANT_HEADER);
            log.info("WebSocket handshake - Tenant from header '{}': {}", TenantHeaderResolver.TENANT_HEADER, tenant);
            
            // If tenant is not in headers, check query parameters
            if (tenant == null) {
                tenant = servletRequest.getParameter("tenantId");
                log.info("WebSocket handshake - Tenant from query parameter 'tenantId': {}", tenant);
            }
            
            Principal principal = servletRequest.getUserPrincipal();
            if (tenant != null) {
                attributes.put("tenantId", tenant);
                log.info("WebSocket handshake - Set tenantId attribute: {}", tenant);
            } else {
                log.warn("WebSocket handshake - No tenant ID found in headers or query parameters");
            }
            if (principal != null) {
                attributes.put("principalName", principal.getName());
            }
            HttpSession httpSession = servletRequest.getSession(false);
            if (httpSession != null) {
                attributes.put("httpSessionId", httpSession.getId());
            }
            log.info("WebSocket handshake tenant={} principal={} session={}", tenant, principal != null ? principal.getName() : null, httpSession != null ? httpSession.getId() : null);
        }
        return true;
    }

    @Override
    public void afterHandshake(@NonNull ServerHttpRequest request,
                               @NonNull ServerHttpResponse response,
                               @NonNull WebSocketHandler wsHandler,
                               @Nullable Exception exception) {
        // no-op
    }
}
