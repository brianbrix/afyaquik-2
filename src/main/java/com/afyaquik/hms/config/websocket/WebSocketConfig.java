package com.afyaquik.hms.config.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.messaging.simp.config.ChannelRegistration;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final TenantHandshakeInterceptor tenantHandshakeInterceptor;
    private final StompAuthChannelInterceptor stompAuthChannelInterceptor;

    public WebSocketConfig(TenantHandshakeInterceptor tenantHandshakeInterceptor,
                           StompAuthChannelInterceptor stompAuthChannelInterceptor) {
        this.tenantHandshakeInterceptor = tenantHandshakeInterceptor;
        this.stompAuthChannelInterceptor = stompAuthChannelInterceptor;
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // Main WebSocket endpoint with tenant and auth interceptors
        registry.addEndpoint("/ws")
                .addInterceptors(tenantHandshakeInterceptor)
                .setAllowedOriginPatterns("*")
                .withSockJS();
        
        // Snapshot-specific endpoints
        registry.addEndpoint("/ws/snapshot")
                .addInterceptors(tenantHandshakeInterceptor)
                .setAllowedOriginPatterns("*")
                .withSockJS();
        
        registry.addEndpoint("/ws/sync")
                .addInterceptors(tenantHandshakeInterceptor)
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        // Enable simple broker for /topic, /queue, and /user destinations
        registry.enableSimpleBroker("/topic", "/queue", "/user");
        
        // Set application destination prefix
        registry.setApplicationDestinationPrefixes("/app");
        
        // Set user destination prefix for private messages
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        registration.interceptors(stompAuthChannelInterceptor);
    }
}
