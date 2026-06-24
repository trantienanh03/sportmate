package com.cdweb.be.controller;

import com.cdweb.be.dto.request.CreateMatchRequest;
import com.cdweb.be.dto.request.ExploreMatchRequest;
import com.cdweb.be.dto.response.MatchDetailDto;
import com.cdweb.be.entity.Match;
import com.cdweb.be.enums.MatchStatus;
import com.cdweb.be.service.MatchService;
import java.util.List;
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
    private final com.cdweb.be.service.GeminiService geminiService;

    @GetMapping
    public ResponseEntity<List<MatchDetailDto>> getMatches(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        Integer userId = (session != null) ? (Integer) session.getAttribute("userId") : null;
        return ResponseEntity.ok(matchService.getMatches(userId));
    }

    @GetMapping("/explore")
    public ResponseEntity<List<MatchDetailDto>> exploreMatches(
            @ModelAttribute ExploreMatchRequest request,
            HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        Integer userId = (session != null) ? (Integer) session.getAttribute("userId") : null;
        return ResponseEntity.ok(matchService.exploreMatches(request, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchDetailDto> getMatch(
            @PathVariable Integer id,
            HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        Integer userId = (session != null) ? (Integer) session.getAttribute("userId") : null;
        return ResponseEntity.ok(matchService.getMatchDetail(id, userId));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<MatchDetailDto> joinMatch(
            @PathVariable Integer id,
            HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(401).build();
        }
        Integer userId = (Integer) session.getAttribute("userId");
        return ResponseEntity.ok(matchService.joinMatch(id, userId));
    }

    @DeleteMapping("/{id}/join")
    public ResponseEntity<MatchDetailDto> leaveMatch(
            @PathVariable Integer id,
            HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(401).build();
        }
        Integer userId = (Integer) session.getAttribute("userId");
        return ResponseEntity.ok(matchService.leaveMatch(id, userId));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<MatchDetailDto> cancelMatch(
            @PathVariable Integer id,
            HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(401).build();
        }
        Integer userId = (Integer) session.getAttribute("userId");
        return ResponseEntity.ok(matchService.cancelMatch(id, userId));
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<MatchDetailDto> resumeMatch(
            @PathVariable Integer id,
            HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(401).build();
        }
        Integer userId = (Integer) session.getAttribute("userId");
        return ResponseEntity.ok(matchService.resumeMatch(id, userId));
    }

    @PostMapping
    public ResponseEntity<?> createMatch(
            @Valid @RequestBody CreateMatchRequest request,
            HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Bạn cần đăng nhập để thực hiện chức năng này"));
        }
        Integer hostId = (Integer) session.getAttribute("userId");
        Match match = matchService.createMatch(request, hostId);
        return ResponseEntity.ok(match);
    }

    @GetMapping("/my-rooms")
    public ResponseEntity<?> getMyRooms(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Bạn cần đăng nhập để thực hiện chức năng này"));
        }
        Integer userId = (Integer) session.getAttribute("userId");
        return ResponseEntity.ok(matchService.getMyCreatedMatches(userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateMatchStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload,
            HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Bạn cần đăng nhập để thực hiện chức năng này"));
        }
        Integer userId = (Integer) session.getAttribute("userId");
        String statusStr = payload.get("status");
        if (statusStr == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Thiếu thông tin trạng thái"));
        }
        MatchStatus status;
        try {
            status = MatchStatus.valueOf(statusStr.toLowerCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Trạng thái không hợp lệ"));
        }
        return ResponseEntity.ok(matchService.updateMatchStatus(id, status, userId));
    }

    @PostMapping("/generate-description")
    public ResponseEntity<?> generateDescription(@RequestBody Map<String, Object> payload) {
        String description = geminiService.generateMatchDescription(payload);
        return ResponseEntity.ok(Map.of("description", description));
    }
}
