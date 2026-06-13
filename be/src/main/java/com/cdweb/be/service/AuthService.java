package com.cdweb.be.service;

import com.cdweb.be.dto.request.LoginRequestDto;
import com.cdweb.be.dto.request.RegisterRequestDto;
import com.cdweb.be.dto.request.UpdateProfileRequestDto;
import com.cdweb.be.dto.response.AuthResponseDto;

public interface AuthService {
    AuthResponseDto register(RegisterRequestDto registerRequestDto);
    AuthResponseDto login(LoginRequestDto loginRequestDto);
    AuthResponseDto getProfile(Integer userId);
    AuthResponseDto updateProfile(Integer userId, UpdateProfileRequestDto request);
    boolean existsByEmail(String email);
    void saveRememberToken(Integer userId, String token, java.time.LocalDateTime expiry, String userAgent, String ipAddress);
    void clearRememberToken(String token);
}
