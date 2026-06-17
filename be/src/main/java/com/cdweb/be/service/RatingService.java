package com.cdweb.be.service;

import com.cdweb.be.dto.request.RatingRequestDto;

import java.util.List;

public interface RatingService {
    void submitBatchRatings(Integer raterId, RatingRequestDto request);
    List<Integer> getUnratedParticipantIds(Integer userId, Integer matchId);
    List<com.cdweb.be.dto.request.RatingItemDto> getMyRatings(Integer userId, Integer matchId);
}
