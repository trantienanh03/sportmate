package com.cdweb.be.config;

import com.cdweb.be.entity.UserRememberToken;
import com.cdweb.be.repository.UserRememberTokenRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class RememberMeFilter implements Filter {

    private final UserRememberTokenRepository tokenRepository;
    private final com.cdweb.be.repository.UserRepository userRepository;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpSession session = httpRequest.getSession(false);

        if (session == null || session.getAttribute("userId") == null) {
            // Tự động khôi phục session (auto-login) từ cookie remember_me nếu session RAM đã bị xoá
            Cookie[] cookies = httpRequest.getCookies();
            if (cookies != null) {
                Arrays.stream(cookies)
                        .filter(c -> "remember_me".equals(c.getName()))
                        .findFirst()
                        .ifPresent(cookie -> {
                            String token = cookie.getValue();
                            tokenRepository.findByToken(token).ifPresent(rememberToken -> {
                                if (rememberToken.getExpiry().isAfter(LocalDateTime.now())
                                        && Boolean.TRUE.equals(rememberToken.getUser().getIsActive())
                                        && !Boolean.TRUE.equals(rememberToken.getUser().getIsBanned())) {
                                    HttpSession newSession = httpRequest.getSession(true);
                                    newSession.setAttribute("userId", rememberToken.getUser().getId());
                                    newSession.setMaxInactiveInterval(30 * 24 * 60 * 60);
                                }
                            });
                        });
            }
        }
        chain.doFilter(request, response);
    }
}
