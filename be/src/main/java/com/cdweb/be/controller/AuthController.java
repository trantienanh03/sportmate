package com.cdweb.be.controller;

import com.cdweb.be.dto.request.LoginRequestDto;
import com.cdweb.be.dto.request.RegisterRequestDto;
import com.cdweb.be.dto.request.ForgotPasswordRequest;
import com.cdweb.be.dto.request.ResetPasswordRequest;
import com.cdweb.be.dto.request.UpdateProfileRequestDto;
import com.cdweb.be.dto.response.AuthResponseDto;
import com.cdweb.be.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

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
    public ResponseEntity<AuthResponseDto> getUserProfile(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(401).build();
        }
        Integer userId = (Integer) session.getAttribute("userId");
        return ResponseEntity.ok(authService.getProfile(userId));
    }

    // API lấy thông tin profile của người dùng khác bằng ID
    @GetMapping("/profile/{id}")
    public ResponseEntity<AuthResponseDto> getOtherUserProfile(@PathVariable Integer id) {
        return ResponseEntity.ok(authService.getProfile(id));
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthResponseDto> updateUserProfile(
            @Valid @RequestBody UpdateProfileRequestDto request,
            HttpServletRequest httpRequest
    ) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(401).build();
        }

        Integer userId = (Integer) session.getAttribute("userId");
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
}
