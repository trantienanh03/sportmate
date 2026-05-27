package com.cdweb.be.service;

import com.cdweb.be.dto.request.CreateMatchRequest;
import com.cdweb.be.dto.response.MatchResponseDto;
import com.cdweb.be.entity.Match;
import java.util.List;

public interface MatchService {
    Match createMatch(CreateMatchRequest request, Integer hostId);
    List<MatchResponseDto> getAllMatches();
}
