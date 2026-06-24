package com.cdweb.be.service;

import com.cdweb.be.dto.request.CreateMatchRequest;
import com.cdweb.be.dto.request.ExploreMatchRequest;
import com.cdweb.be.dto.response.MatchDetailDto;
import com.cdweb.be.entity.Match;

import java.util.List;

public interface MatchService {
    List<MatchDetailDto> getMatches(Integer currentUserId);
    MatchDetailDto getMatchDetail(Integer matchId, Integer currentUserId);
    MatchDetailDto joinMatch(Integer matchId, Integer userId);
    MatchDetailDto leaveMatch(Integer matchId, Integer userId);
    MatchDetailDto cancelMatch(Integer matchId, Integer hostId);
    MatchDetailDto resumeMatch(Integer matchId, Integer hostId);
    Match createMatch(CreateMatchRequest request, Integer hostId);
    List<MatchDetailDto> getMyCreatedMatches(Integer hostId);
    MatchDetailDto updateMatchStatus(Integer matchId, com.cdweb.be.enums.MatchStatus status, Integer hostId);
    List<MatchDetailDto> exploreMatches(ExploreMatchRequest request, Integer currentUserId);
    List<MatchDetailDto> getUserSchedule(Integer userId);
}
