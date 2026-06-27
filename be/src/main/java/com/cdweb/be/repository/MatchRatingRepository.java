package com.cdweb.be.repository;

import com.cdweb.be.entity.MatchRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRatingRepository extends JpaRepository<MatchRating, Long> {
    List<MatchRating> findByMatchIdAndRaterId(Integer matchId, Integer raterId);
    @org.springframework.data.jpa.repository.Query("SELECT r FROM MatchRating r JOIN FETCH r.rater JOIN FETCH r.match WHERE r.ratee.id = :rateeId")
    List<MatchRating> findByRateeId(@org.springframework.data.repository.query.Param("rateeId") Integer rateeId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(r), AVG(r.skillScore), AVG(r.attitudeScore) FROM MatchRating r WHERE r.ratee.id = :rateeId")
    List<Object[]> getRatingStatsByRateeId(@org.springframework.data.repository.query.Param("rateeId") Integer rateeId);
}
