package com.cdweb.be.security;

import com.cdweb.be.entity.User;
import com.cdweb.be.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

/**
 * Filter that executes on every request to check if a user session exists,
 * validates the user's status (banned/active), and populates the
 * SecurityContextHolder with the UserPrincipal authentication token.
 */
@Component
@RequiredArgsConstructor
public class SessionAuthenticationFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        HttpSession session = request.getSession(false);

        if (session != null && session.getAttribute("userId") != null) {
            Integer userId = (Integer) session.getAttribute("userId");

            userRepository.findById(userId).ifPresent(user -> {
                // Check if user is banned
                if (Boolean.TRUE.equals(user.getIsBanned())) {
                    if (user.getBannedUntil() != null && user.getBannedUntil().isBefore(LocalDateTime.now())) {
                        user.setIsBanned(false);
                        user.setIsActive(true);
                        user.setBannedUntil(null);
                        userRepository.save(user);
                    } else {
                        session.invalidate();
                        SecurityContextHolder.clearContext();
                        return;
                    }
                } else if (!Boolean.TRUE.equals(user.getIsActive())) {
                    session.invalidate();
                    SecurityContextHolder.clearContext();
                    return;
                }

                // User is valid, populate SecurityContextHolder
                UserPrincipal userPrincipal = UserPrincipal.create(user);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userPrincipal, null, userPrincipal.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            });
        }

        filterChain.doFilter(request, response);
    }
}
