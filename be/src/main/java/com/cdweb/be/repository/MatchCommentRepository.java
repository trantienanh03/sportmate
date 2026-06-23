package com.cdweb.be.repository;

import com.cdweb.be.entity.MatchComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchCommentRepository extends JpaRepository<MatchComment, Long> {
    List<MatchComment> findByMatchIdOrderByCreatedAtDesc(Integer matchId);
    List<MatchComment> findByMatchIdAndParentCommentIsNullOrderByCreatedAtDesc(Integer matchId);
}
