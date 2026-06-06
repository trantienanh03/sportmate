package com.cdweb.be.repository;

import com.cdweb.be.entity.Match;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchRepository extends JpaRepository<Match, Integer> {
    List<Match> findByHostIdOrderByStartTimeDesc(Integer hostId);
}
