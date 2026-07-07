package com.cdweb.be.controller;

import com.cdweb.be.dto.request.LoginRequestDto;
import com.cdweb.be.dto.request.RegisterRequestDto;
import com.cdweb.be.dto.request.ForgotPasswordRequest;
import com.cdweb.be.dto.request.ResetPasswordRequest;
import com.cdweb.be.dto.request.UpdateProfileRequestDto;
import com.cdweb.be.dto.response.AuthResponseDto;
import com.cdweb.be.security.CustomUserDetailsService;
import com.cdweb.be.service.AuthService;
import com.cdweb.be.util.SecurityUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CustomUserDetailsService userDetailsService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
        AuthResponseDto response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(authService.existsByEmail(email));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(
            @Valid @RequestBody LoginRequestDto request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        AuthResponseDto response = authService.login(request);

        HttpSession session = httpRequest.getSession();
        session.setAttribute("userId", response.getId());
        session.setAttribute("role", response.getRole());

        // Set Authentication in SecurityContextHolder
        UserDetails userDetails = userDetailsService.loadUserById(response.getId());
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        if (Boolean.TRUE.equals(request.getKeepLoggedIn())) {
            String token = UUID.randomUUID().toString();
            String userAgent = httpRequest.getHeader("User-Agent");
            String ipAddress = httpRequest.getRemoteAddr();

            LocalDateTime expiry = LocalDateTime.now().plusDays(30);
            authService.saveRememberToken(response.getId(), token, expiry, userAgent, ipAddress);

            Cookie cookie = new Cookie("remember_me", token);
            cookie.setMaxAge(30 * 24 * 60 * 60);
            cookie.setPath("/");
            cookie.setHttpOnly(true);
            cookie.setSecure(httpRequest.isSecure());
            httpResponse.addCookie(cookie);

            session.setMaxInactiveInterval(30 * 24 * 60 * 60);
        } else {
            session.setMaxInactiveInterval(30 * 60);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // Clear Authentication in SecurityContextHolder
        SecurityContextHolder.clearContext();

        Cookie[] cookies = httpRequest.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("remember_me".equals(cookie.getName())) {
                    authService.clearRememberToken(cookie.getValue());
                }
            }
        }

        Cookie cookie = new Cookie("remember_me", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(httpRequest.isSecure());
        httpResponse.addCookie(cookie);

        return ResponseEntity.ok("Đăng xuất thành công");
    }

    @GetMapping("/profile")
    public ResponseEntity<AuthResponseDto> getUserProfile() {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.getProfile(userId));
    }

    // API lấy thông tin profile của người dùng khác bằng ID
    @GetMapping("/profile/{id}")
    public ResponseEntity<AuthResponseDto> getOtherUserProfile(@PathVariable Integer id) {
        return ResponseEntity.ok(authService.getProfile(id));
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthResponseDto> updateUserProfile(
            @Valid @RequestBody UpdateProfileRequestDto request
    ) {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.updateProfile(userId, request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestForgotPassword(request);
        return ResponseEntity.ok("Yêu cầu thành công, liên kết đặt lại mật khẩu đã được gửi đến email của bạn");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Đặt lại mật khẩu thành công");
    }

    @PostMapping("/appeal")
    public ResponseEntity<String> submitAppeal(@RequestBody java.util.Map<String, String> body) {
        String email = body.get("email");
        String title = body.get("title");
        String details = body.get("details");

        if (email == null || email.isBlank() || title == null || title.isBlank()) {
            throw new com.cdweb.be.exception.AppException(org.springframework.http.HttpStatus.BAD_REQUEST, "Vui lòng nhập email và tiêu đề kháng cáo");
        }

        authService.submitAppeal(email, title, details);
        return ResponseEntity.ok("Gửi đơn kháng cáo thành công. Ban Quản Trị sẽ xem xét và phản hồi lại bạn.");
    }
}
