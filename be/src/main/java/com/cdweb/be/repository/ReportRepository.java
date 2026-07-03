package com.cdweb.be.repository;

import com.cdweb.be.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByReportedMatchId(Integer matchId);
    List<Report> findByReportedUserId(Integer userId);
    Optional<Report> findByReporterIdAndReportedMatchId(Integer reporterId, Integer matchId);
    Optional<Report> findByReporterIdAndReportedUserId(Integer reporterId, Integer reportedUserId);
    long countByReportedUserId(Integer userId);

    @Query("SELECT r.reportedUser.id, COUNT(r) FROM Report r WHERE r.reportedUser.id IN :userIds GROUP BY r.reportedUser.id")
    List<Object[]> countReportsByUserIds(@Param("userIds") List<Integer> userIds);

    long countByStatus(String status);

    @Query("SELECT r FROM Report r " +
           "LEFT JOIN r.reportedUser ru " +
           "LEFT JOIN r.reportedMatch rm " +
           "WHERE (:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(r.reporter.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "(ru IS NOT NULL AND LOWER(ru.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
           "(rm IS NOT NULL AND LOWER(rm.title) LIKE LOWER(CONCAT('%', :keyword, '%')))) AND " +
           "(:status IS NULL OR :status = '' OR r.status = :status)")
    org.springframework.data.domain.Page<Report> searchReportsAdmin(@Param("keyword") String keyword, @Param("status") String status, org.springframework.data.domain.Pageable pageable);

    @Query(value = "SELECT COUNT(*) FROM reports WHERE DATE(created_at) = CURRENT_DATE", nativeQuery = true)
    long countReportsCreatedToday();
}
