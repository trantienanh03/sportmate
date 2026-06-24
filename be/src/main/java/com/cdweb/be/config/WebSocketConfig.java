package com.cdweb.be.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Định tuyến tin nhắn từ Server -> Client
        config.enableSimpleBroker("/topic", "/queue");
        
        // Định tuyến tin nhắn từ Client -> Server (vào các @MessageMapping)
        config.setApplicationDestinationPrefixes("/app");
        
        // Kênh đặc biệt dùng để báo lỗi riêng cho từng user
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:5173", "http://localhost:5174", "http://localhost:5175")
                .addInterceptors(new HttpSessionHandshakeInterceptor())
                .withSockJS();
    }
}
