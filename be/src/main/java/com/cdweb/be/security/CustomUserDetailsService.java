package com.cdweb.be.security;

import com.cdweb.be.entity.User;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Load user by email — used by Spring Security during authentication.
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        return UserPrincipal.create(user);
    }

    /**
     * Load user by ID — used by JwtAuthenticationFilter on every authenticated request.
     * This DB lookup ensures that banned or deactivated accounts are denied access
     * even if their JWT token has not yet expired.
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Người dùng không tồn tại"));
        return UserPrincipal.create(user);
    }
}
