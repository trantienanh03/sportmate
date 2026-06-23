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
}
