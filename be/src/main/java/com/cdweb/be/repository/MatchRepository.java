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

    List<Match> findByHostIdOrderByStartTimeDesc(Integer hostId);

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
}
