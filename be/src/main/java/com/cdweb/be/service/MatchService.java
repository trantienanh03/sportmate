package com.cdweb.be.service;

import com.cdweb.be.dto.request.CreateMatchRequest;
import com.cdweb.be.dto.response.MatchDetailDto;
import com.cdweb.be.entity.Match;

public interface MatchService {
    MatchDetailDto getMatchDetail(Integer matchId, Integer currentUserId);
    MatchDetailDto joinMatch(Integer matchId, Integer userId);
    MatchDetailDto leaveMatch(Integer matchId, Integer userId);
    Match createMatch(CreateMatchRequest request, Integer hostId);
}
