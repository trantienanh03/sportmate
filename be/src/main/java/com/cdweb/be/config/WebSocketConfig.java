package com.cdweb.be.config;

import com.cdweb.be.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtTokenProvider tokenProvider;

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
                .setAllowedOriginPatterns("http://localhost:5173")
                .addInterceptors(new HandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
                        try {
                            String query = request.getURI().getQuery();
                            String token = null;
                            if (query != null && query.contains("token=")) {
                                for (String param : query.split("&")) {
                                    if (param.startsWith("token=")) {
                                        token = java.net.URLDecoder.decode(param.substring(6), java.nio.charset.StandardCharsets.UTF_8);
                                        break;
                                    }
                                }
                            }

                            if (token != null && tokenProvider.validateToken(token)) {
                                Integer userId = tokenProvider.getUserIdFromJWT(token);
                                attributes.put("userId", userId);
                                log.info("WebSocket handshake successful for userId: {}", userId);
                            } else {
                                log.warn("WebSocket handshake attempted without valid JWT token. Query: {}", query);
                            }
                        } catch (Exception e) {
                            log.error("Error extracting JWT token during WebSocket handshake", e);
                        }
                        return true; // Cho phép connection kết nối (nếu validate chặt hơn có thể return false khi token invalid)
                    }

                    @Override
                    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                               WebSocketHandler wsHandler, Exception exception) {
                    }
                })
                .withSockJS();
    }
}
