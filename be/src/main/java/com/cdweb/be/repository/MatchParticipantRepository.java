package com.cdweb.be.repository;

import com.cdweb.be.entity.MatchParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchParticipantRepository extends JpaRepository<MatchParticipant, Integer> {

    List<MatchParticipant> findByMatch_Id(Integer matchId);

    Optional<MatchParticipant> findByMatch_IdAndUser_Id(Integer matchId, Integer userId);

    boolean existsByMatch_IdAndUser_Id(Integer matchId, Integer userId);

    List<MatchParticipant> findByMatch_IdIn(List<Integer> matchIds);

    @org.springframework.data.jpa.repository.Query("SELECT mp.match.id FROM MatchParticipant mp WHERE mp.user.id = :userId AND mp.match.id IN :matchIds")
    List<Integer> findJoinedMatchIds(
            @org.springframework.data.repository.query.Param("userId") Integer userId,
            @org.springframework.data.repository.query.Param("matchIds") List<Integer> matchIds
    );
}
