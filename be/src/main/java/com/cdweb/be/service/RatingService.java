package com.cdweb.be.service;

import com.cdweb.be.dto.request.RatingRequestDto;
import com.cdweb.be.dto.request.RatingItemDto;
import com.cdweb.be.dto.response.UserReviewDto;

import java.util.List;

public interface RatingService {
    void submitBatchRatings(Integer raterId, RatingRequestDto request);
    List<Integer> getUnratedParticipantIds(Integer userId, Integer matchId);
    List<RatingItemDto> getMyRatings(Integer userId, Integer matchId);
    List<UserReviewDto> getUserReviews(Integer userId);
}
