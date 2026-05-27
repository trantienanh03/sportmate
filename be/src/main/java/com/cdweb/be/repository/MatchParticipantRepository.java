package com.cdweb.be.repository;

import com.cdweb.be.entity.MatchParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchParticipantRepository extends JpaRepository<MatchParticipant, Integer> {

    List<MatchParticipant> findByMatchId(Integer matchId);

    Optional<MatchParticipant> findByMatchIdAndUserId(Integer matchId, Integer userId);

    boolean existsByMatchIdAndUserId(Integer matchId, Integer userId);
}
