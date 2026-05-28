package com.cdweb.be.repository;

import com.cdweb.be.entity.MatchParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchParticipantRepository extends JpaRepository<MatchParticipant, Integer> {

    List<MatchParticipant> findByMatch_Id(Integer matchId);

    Optional<MatchParticipant> findByMatch_IdAndUser_Id(Integer matchId, Integer userId);

    boolean existsByMatch_IdAndUser_Id(Integer matchId, Integer userId);
}
