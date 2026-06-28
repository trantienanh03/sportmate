package com.cdweb.be.repository;

import com.cdweb.be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE " +
           "(CAST(:keyword AS string) IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR LOWER(u.phone) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) AND " +
           "(CAST(:status AS string) IS NULL OR (CAST(:status AS string) = 'ACTIVE' AND u.isActive = true AND u.isBanned = false) OR (CAST(:status AS string) = 'BANNED' AND u.isBanned = true)) AND " +
           "(CAST(:role AS string) IS NULL OR CAST(u.role AS string) = CAST(:role AS string))")
    org.springframework.data.domain.Page<User> searchUsers(@org.springframework.data.repository.query.Param("keyword") String keyword, @org.springframework.data.repository.query.Param("status") String status, @org.springframework.data.repository.query.Param("role") String role, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query(value = "SELECT TO_CHAR(u.created_at, 'MM/YYYY') as month, COUNT(u.id) FROM users u GROUP BY TO_CHAR(u.created_at, 'MM/YYYY'), EXTRACT(YEAR FROM u.created_at), EXTRACT(MONTH FROM u.created_at) ORDER BY EXTRACT(YEAR FROM u.created_at), EXTRACT(MONTH FROM u.created_at)", nativeQuery = true)
    java.util.List<Object[]> countUsersByMonth();

    java.util.List<User> findTop5ByOrderByCreatedAtDesc();

    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE", nativeQuery = true)
    long countUsersCreatedToday();

    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'", nativeQuery = true)
    long countUsersCreatedThisWeek();
}
