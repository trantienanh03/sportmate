package com.cdweb.be.service.impl;

import com.cdweb.be.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${MAIL_FROM:SportMate <noreply@sportmate.com>}")
    private String mailFrom;

    @Override
    public void sendPasswordResetEmail(String toEmail, String fullName, String resetUrl) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, 
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, 
                    StandardCharsets.UTF_8.name());

            helper.setTo(toEmail);
            helper.setSubject("Yêu cầu đặt lại mật khẩu của bạn - SportMate");
            helper.setFrom(mailFrom);

            // Dùng Thymeleaf TemplateEngine để biên dịch file HTML template
            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("resetUrl", resetUrl);
            String htmlContent = templateEngine.process("email-reset", context);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email khôi phục mật khẩu đã được gửi thành công đến: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Lỗi khi gửi email khôi phục mật khẩu đến {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Không thể gửi email khôi phục mật khẩu. Vui lòng thử lại sau.");
        }
    }
}
