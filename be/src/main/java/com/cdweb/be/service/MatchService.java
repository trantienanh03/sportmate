package com.cdweb.be.service;

import com.cdweb.be.dto.request.CreateMatchRequest;
import com.cdweb.be.entity.Match;

public interface MatchService {
    Match createMatch(CreateMatchRequest request, Integer hostId);
}
