package com.cdweb.be.service.impl;

import com.cdweb.be.dto.request.LoginRequestDto;
import com.cdweb.be.dto.request.RegisterRequestDto;
import com.cdweb.be.dto.request.UpdateProfileRequestDto;
import com.cdweb.be.dto.response.AuthResponseDto;
import com.cdweb.be.entity.User;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.UserRepository;
import com.cdweb.be.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AuthResponseDto register(RegisterRequestDto registerRequestDto) {
        if (userRepository.existsByEmail(registerRequestDto.getEmail())) {
            throw new AppException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = User.builder()
                .fullName(registerRequestDto.getFullName())
                .email(registerRequestDto.getEmail())
                .passwordHash(passwordEncoder.encode(registerRequestDto.getPassword()))
                .build();

        return toDto(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponseDto login(LoginRequestDto loginRequestDto) {
        User user = userRepository.findByEmail(loginRequestDto.getEmail())
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Email or password incorrect"));

        if (!passwordEncoder.matches(loginRequestDto.getPassword(), user.getPasswordHash())) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Email or password incorrect");
        }

        if (!user.getIsActive() || user.getIsBanned()) {
            throw new AppException(HttpStatus.FORBIDDEN, "Account has been banned or inactive");
        }

        return toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponseDto getProfile(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
        return toDto(user);
    }

    @Override
    @Transactional
    public AuthResponseDto updateProfile(Integer userId, UpdateProfileRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        user.setFullName(request.getFullName().trim());
        user.setAvatarUrl(request.getAvatarUrl() == null || request.getAvatarUrl().isBlank()
                ? null : request.getAvatarUrl().trim());
        user.setBio(request.getBio() == null || request.getBio().isBlank()
                ? null : request.getBio().trim());
        user.setDistrict(request.getDistrict() == null || request.getDistrict().isBlank()
                ? null : request.getDistrict().trim());
        user.setLat(request.getLat());
        user.setLng(request.getLng());

        return toDto(userRepository.save(user));
    }

    private AuthResponseDto toDto(User user) {
        return AuthResponseDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .district(user.getDistrict())
                .lat(user.getLat())
                .lng(user.getLng())
                .isActive(user.getIsActive())
                .isBanned(user.getIsBanned())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
