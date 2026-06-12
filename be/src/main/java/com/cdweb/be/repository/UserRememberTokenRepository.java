package com.cdweb.be.repository;

import com.cdweb.be.entity.UserRememberToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface UserRememberTokenRepository extends JpaRepository<UserRememberToken, Integer> {
    Optional<UserRememberToken> findByToken(String token);

    @Transactional
    void deleteByToken(String token);

    @Transactional
    void deleteByUserId(Integer userId);
}
