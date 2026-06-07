package com.cdweb.be.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Server → Client: broadcast qua /topic/...
        config.enableSimpleBroker("/topic", "/queue");

        // Client → Server: gửi tới /app/...
        config.setApplicationDestinationPrefixes("/app");

        // Kênh lỗi riêng cho từng user: /user/queue/errors
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:5173")
                // SockJS fallback cho browser không hỗ trợ WebSocket native
                .withSockJS();
    }
}
