package com.cdweb.be.repository;

import com.cdweb.be.entity.Match;
import jakarta.persistence.LockModeType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.cdweb.be.enums.MatchStatus;

public interface MatchRepository extends JpaRepository<Match, Integer> {
    @Modifying
    @Transactional
    @Query(value = "UPDATE matches SET status = 'completed'::match_status WHERE start_time < :now AND status IN ('open'::match_status, 'full'::match_status)", nativeQuery = true)
    int autoCompleteExpiredMatches(@Param("now") LocalDateTime now);

    @Query(value = "SELECT m.* FROM matches m WHERE m.status IN ('open'::match_status, 'full'::match_status) AND m.start_time > :now ORDER BY m.start_time ASC", nativeQuery = true)
    List<Match> findUpcomingMatches(@Param("now") LocalDateTime now);
    
    // Truy vấn native lấy các trận đấu chưa kết thúc (open/full) mà user làm host hoặc đã tham gia thành công (joined)
    // Sắp xếp theo thứ tự start_time tăng dần (gần nhất đến xa nhất)
    @Query(value = "SELECT DISTINCT m.* FROM matches m " +
                   "LEFT JOIN match_participants mp ON m.id = mp.match_id " +
                   "WHERE (m.host_id = :userId OR (mp.user_id = :userId AND mp.status = 'joined')) " +
                   "AND m.status IN ('open'::match_status, 'full'::match_status) " +
                   "AND m.start_time > :now " +
                   "ORDER BY m.start_time ASC", nativeQuery = true)
    List<Match> findUserSchedule(@Param("userId") Integer userId, @Param("now") LocalDateTime now);

    List<Match> findByHostIdOrderByStartTimeDesc(Integer hostId);

    List<Match> findAllByOrderByCreatedAtDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from Match m where m.id = :id")
    Optional<Match> findByIdForUpdate(@Param("id") Integer id);

    @Query("SELECT m FROM Match m JOIN m.host h WHERE h.id = :userId")
    Page<Match> findAllByHostUserId(@Param("userId") Integer userId, Pageable pageable);

    List<Match> findByStatusInAndEndTimeBefore(List<MatchStatus> statuses, LocalDateTime endTime);

    @Query(value = """
        SELECT m.* FROM matches m
        LEFT JOIN venues v ON m.venue_id = v.id
        WHERE m.status = 'open'
          AND m.start_time > NOW()
          AND (:keyword IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:sport IS NULL OR LOWER(m.sport) = LOWER(:sport))
          AND (:skillLevel IS NULL OR CAST(m.skill_level AS TEXT) = :skillLevel OR CAST(m.skill_level AS TEXT) = 'all')
          AND (:feeType IS NULL
               OR (:feeType = 'free' AND m.fee_per_person = 0)
               OR (:feeType = 'paid' AND m.fee_per_person > 0))
          AND (:lat IS NULL OR :lng IS NULL OR :radiusKm IS NULL
               OR (COALESCE(v.lat, m.lat) IS NOT NULL
                   AND COALESCE(v.lng, m.lng) IS NOT NULL
                   AND (6371 * acos(
                       LEAST(1.0, GREATEST(-1.0,
                           cos(radians(:lat))
                           * cos(radians(COALESCE(v.lat, m.lat)))
                           * cos(radians(COALESCE(v.lng, m.lng)) - radians(:lng))
                           + sin(radians(:lat))
                           * sin(radians(COALESCE(v.lat, m.lat)))
                       ))
                   )) <= :radiusKm))
        ORDER BY m.start_time ASC
        """, nativeQuery = true)
    List<Match> exploreMatches(
            @Param("keyword") String keyword,
            @Param("sport") String sport,
            @Param("skillLevel") String skillLevel,
            @Param("feeType") String feeType,
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("radiusKm") Double radiusKm
    );
    @Query(value = "SELECT COUNT(*) FROM matches WHERE DATE(created_at) = CURRENT_DATE", nativeQuery = true)
    long countMatchesCreatedToday();

    @Query(value = "SELECT AVG(CAST(joined_count AS FLOAT) / NULLIF(max_players, 0)) FROM (" +
                   "  SELECT m.max_players, COUNT(mp.id) as joined_count " +
                   "  FROM matches m " +
                   "  LEFT JOIN match_participants mp ON m.id = mp.match_id AND mp.status = 'joined' " +
                   "  GROUP BY m.id, m.max_players" +
                   ") subquery", nativeQuery = true)
    Double getAverageFillRate();
    @Query("SELECT m FROM Match m WHERE " +
           "(CAST(:keyword AS string) IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) AND " +
           "(CAST(:status AS string) IS NULL OR CAST(m.status AS string) = CAST(:status AS string))")
    Page<Match> searchMatchesAdmin(@Param("keyword") String keyword, @Param("status") String status, Pageable pageable);

    @Query(value = "SELECT TO_CHAR(m.created_at, 'MM/YYYY') as month, COUNT(m.id) FROM matches m GROUP BY TO_CHAR(m.created_at, 'MM/YYYY'), EXTRACT(YEAR FROM m.created_at), EXTRACT(MONTH FROM m.created_at) ORDER BY EXTRACT(YEAR FROM m.created_at), EXTRACT(MONTH FROM m.created_at)", nativeQuery = true)
    List<Object[]> countMatchesByMonth();

    @Query(value = "SELECT m.sport, COUNT(m.id) FROM matches m GROUP BY m.sport ORDER BY COUNT(m.id) DESC", nativeQuery = true)
    List<Object[]> countMatchesBySport();

    List<Match> findTop5ByOrderByCreatedAtDesc();

    @Query(value = "SELECT COUNT(*) FROM matches WHERE status = 'completed'::match_status AND DATE(start_time) = CURRENT_DATE", nativeQuery = true)
    long countCompletedMatchesToday();
}
