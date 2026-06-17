package com.cdweb.be.repository;

import com.cdweb.be.entity.MatchRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRatingRepository extends JpaRepository<MatchRating, Long> {
    List<MatchRating> findByMatchIdAndRaterId(Integer matchId, Integer raterId);
    List<MatchRating> findByRateeId(Integer rateeId);
}
