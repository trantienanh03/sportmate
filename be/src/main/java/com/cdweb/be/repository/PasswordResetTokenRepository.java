package com.cdweb.be.repository;

import com.cdweb.be.entity.PasswordResetToken;
import com.cdweb.be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {
    Optional<PasswordResetToken> findByToken(String token);

    @Transactional
    void deleteByToken(String token);

    @Transactional
    void deleteByUser(User user);
}
