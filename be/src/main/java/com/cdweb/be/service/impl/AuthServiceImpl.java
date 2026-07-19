package com.cdweb.be.service.impl;

import com.cdweb.be.dto.request.LoginRequestDto;
import com.cdweb.be.dto.request.RegisterRequestDto;
import com.cdweb.be.dto.request.ForgotPasswordRequest;
import com.cdweb.be.dto.request.ResetPasswordRequest;
import com.cdweb.be.dto.request.UpdateProfileRequestDto;
import com.cdweb.be.dto.response.AuthResponseDto;
import com.cdweb.be.entity.User;
import com.cdweb.be.entity.UserRememberToken;
import com.cdweb.be.entity.PasswordResetToken;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.UserRepository;
import com.cdweb.be.repository.UserRememberTokenRepository;
import com.cdweb.be.repository.PasswordResetTokenRepository;
import com.cdweb.be.service.AuthService;
import com.cdweb.be.service.EmailService;
import com.cdweb.be.util.BadgeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

import com.cdweb.be.repository.UserStatRepository;
import com.cdweb.be.repository.ReportRepository;
import com.cdweb.be.entity.UserStat;
import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserRememberTokenRepository tokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final UserStatRepository userStatRepository;
    private final ReportRepository reportRepository;

    @Value("${FRONTEND_URL}")
    private String frontendUrl;

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
                .district(registerRequestDto.getDistrict() != null ? registerRequestDto.getDistrict().trim() : null)
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

        // Kiểm tra tài khoản: hỗ trợ tự động mở khóa khi bannedUntil đã qua
        if (!user.getIsActive()) {
            throw new AppException(HttpStatus.FORBIDDEN, "Tài khoản đã bị vô hiệu hóa");
        }

        if (user.getIsBanned()) {
            if (user.getBannedUntil() != null && user.getBannedUntil().isBefore(LocalDateTime.now())) {
                // Thời gian khóa đã hết hạn → tự động mở khóa
                user.setIsBanned(false);
                user.setBannedUntil(null);
                userRepository.save(user);
            } else {
                String msg = user.getBannedUntil() != null
                    ? "Tài khoản bị khóa tạm thời đến " + user.getBannedUntil().toLocalDate()
                    : "Tài khoản bị khóa vĩnh viễn";
                throw new AppException(HttpStatus.FORBIDDEN, msg);
            }
        }

        return toDto(user);
    }

    @Override
    @Transactional
    public AuthResponseDto getProfile(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        if (Boolean.TRUE.equals(user.getIsBanned())) {
            if (user.getBannedUntil() != null && user.getBannedUntil().isBefore(LocalDateTime.now())) {
                // Thời gian khóa đã hết hạn -> tự động mở khóa
                user.setIsBanned(false);
                user.setIsActive(true);
                user.setBannedUntil(null);
                userRepository.save(user);
            } else {
                String msg = user.getBannedUntil() != null
                    ? "Tài khoản của bạn đã bị khóa tạm thời đến " + user.getBannedUntil().toLocalDate()
                    : "Tài khoản của bạn đã bị khóa vĩnh viễn";
                throw new AppException(HttpStatus.FORBIDDEN, msg);
            }
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Tài khoản đã bị vô hiệu hóa");
        }

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
        user.setSports(request.getSports());
        user.setAvailability(request.getAvailability());

        return toDto(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    @Transactional
    public void saveRememberToken(Integer userId, String token, LocalDateTime expiry, String userAgent, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        UserRememberToken rememberToken = UserRememberToken.builder()
                .user(user)
                .token(token)
                .expiry(expiry)
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .build();
        tokenRepository.save(rememberToken);
    }

    @Override
    @Transactional
    public void clearRememberToken(String token) {
        tokenRepository.deleteByToken(token);
    }



    @Override
    @Transactional
    public void requestForgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Email không tồn tại trong hệ thống"));

        // Xóa token cũ của user nếu có
        passwordResetTokenRepository.deleteByUser(user);

        // Tạo token mới có thời hạn 15 phút
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiry(LocalDateTime.now().plusMinutes(15))
                .build();
        passwordResetTokenRepository.save(resetToken);

        // Gửi email khôi phục mật khẩu
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetUrl);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng"));

        if (resetToken.getExpiry().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new AppException(HttpStatus.BAD_REQUEST, "Liên kết đặt lại mật khẩu đã hết hạn");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Hủy bỏ token đã sử dụng
        passwordResetTokenRepository.delete(resetToken);
    }

    @Override
    @Transactional
    public void submitAppeal(String email, String title, String details) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản với email này"));

        com.cdweb.be.entity.Report appeal = com.cdweb.be.entity.Report.builder()
                .reporter(user)
                .reportedUser(user)
                .reason("KHÁNG CÁO: " + title)
                .details("Email kháng cáo: " + email + "\nChi tiết kháng cáo:\n" + details)
                .status("PENDING")
                .build();

        reportRepository.save(appeal);
    }

    private AuthResponseDto toDto(User user) {
        UserStat stat = userStatRepository.findByUserId(user.getId()).orElse(null);
        long reportCount = reportRepository.countByReportedUserId(user.getId());
        List<String> badges = BadgeUtil.calculateBadges(stat, reportCount);

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
                .sports(user.getSports())
                .availability(user.getAvailability())
                .avgAttitudeScore(stat != null ? stat.getAvgAttitudeScore() : null)
                .avgSkillScore(stat != null ? stat.getAvgSkillScore() : null)
                .completedMatches(stat != null ? stat.getCompletedMatches() : 0)
                .badges(badges)
                .isActive(user.getIsActive())
                .isBanned(user.getIsBanned())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
