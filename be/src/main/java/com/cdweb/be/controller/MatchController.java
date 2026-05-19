package com.cdweb.be.controller;

import com.cdweb.be.dto.request.CreateMatchRequest;
import com.cdweb.be.entity.Match;
import com.cdweb.be.service.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @PostMapping
    public ResponseEntity<?> createMatch(@Valid @RequestBody CreateMatchRequest request) {
        // TODO: In a real app, extract user ID from Spring Security context / JWT token
        // For now, we will hardcode the hostId = 1 (assuming user ID 1 exists in DB)
        Integer hostId = 1;

        Match match = matchService.createMatch(request, hostId);
        
        return ResponseEntity.ok(match);
    }
}
