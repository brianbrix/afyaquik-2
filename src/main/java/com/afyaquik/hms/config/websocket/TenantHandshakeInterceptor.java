package com.afyaquik.hms.config.websocket;

import com.afyaquik.hms.common.web.TenantHeaderResolver;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.lang.Nullable;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.security.Principal;
import java.util.Map;

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
            String tenant = servletRequest.getHeader(TenantHeaderResolver.TENANT_HEADER);
            Principal principal = servletRequest.getUserPrincipal();
            if (tenant != null) {
                attributes.put("tenantId", tenant);
            }
            if (principal != null) {
                attributes.put("principalName", principal.getName());
            }
            HttpSession httpSession = servletRequest.getSession(false);
            if (httpSession != null) {
                attributes.put("httpSessionId", httpSession.getId());
            }
            log.debug("WebSocket handshake tenant={} principal={} session={}", tenant, principal != null ? principal.getName() : null, httpSession != null ? httpSession.getId() : null);
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
