package com.cdweb.be.service;

public interface EmailService {
    void sendPasswordResetEmail(String toEmail, String fullName, String resetUrl);
}
