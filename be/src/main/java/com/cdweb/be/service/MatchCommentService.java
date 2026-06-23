package com.cdweb.be.service;

import com.cdweb.be.dto.MatchCommentDto;
import com.cdweb.be.dto.request.MatchCommentRequestDto;

import java.util.List;

public interface MatchCommentService {
    List<MatchCommentDto> getCommentsByMatchId(Integer matchId);
    MatchCommentDto addComment(Integer userId, MatchCommentRequestDto request);
    MatchCommentDto updateComment(Integer userId, Long commentId, MatchCommentRequestDto request);
    void deleteComment(Integer userId, Long commentId);
}
