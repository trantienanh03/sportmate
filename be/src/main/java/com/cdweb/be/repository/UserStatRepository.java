package com.cdweb.be.repository;

import com.cdweb.be.entity.UserStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserStatRepository extends JpaRepository<UserStat, Integer> {
    Optional<UserStat> findByUserId(Integer userId);
    List<UserStat> findByUserIdIn(List<Integer> userIds);
}
