package com.cdweb.be.controller;

import com.cdweb.be.dto.request.CreateMatchRequest;
import com.cdweb.be.entity.Match;
import com.cdweb.be.service.MatchService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @PostMapping
    public ResponseEntity<?> createMatch(@Valid @RequestBody CreateMatchRequest request, HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Bạn cần đăng nhập để thực hiện chức năng này"));
        }
        Integer hostId = (Integer) session.getAttribute("userId");

        Match match = matchService.createMatch(request, hostId);
        
        return ResponseEntity.ok(match);
    }
}

