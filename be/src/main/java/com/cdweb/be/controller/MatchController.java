package com.cdweb.be.controller;

import com.cdweb.be.dto.request.CreateMatchRequest;
import com.cdweb.be.dto.request.ExploreMatchRequest;
import com.cdweb.be.dto.response.MatchDetailDto;
import com.cdweb.be.entity.Match;
import com.cdweb.be.enums.MatchStatus;
import com.cdweb.be.service.MatchService;
import com.cdweb.be.util.SecurityUtils;
import java.util.List;
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
    public ResponseEntity<List<MatchDetailDto>> getMatches() {
        Integer userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(matchService.getMatches(userId));
    }

    @GetMapping("/explore")
    public ResponseEntity<List<MatchDetailDto>> exploreMatches(
            @ModelAttribute ExploreMatchRequest request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(matchService.exploreMatches(request, userId));
    }

    // API lấy lịch trình cá nhân của người dùng (các trận đấu tham gia hoặc làm
    // host)
    @GetMapping("/schedule")
    public ResponseEntity<List<MatchDetailDto>> getUserSchedule() {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(matchService.getUserSchedule(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchDetailDto> getMatch(@PathVariable Integer id) {
        Integer userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(matchService.getMatchDetail(id, userId));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<MatchDetailDto> joinMatch(@PathVariable Integer id) {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(matchService.joinMatch(id, userId));
    }

    @DeleteMapping("/{id}/join")
    public ResponseEntity<MatchDetailDto> leaveMatch(@PathVariable Integer id) {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(matchService.leaveMatch(id, userId));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<MatchDetailDto> cancelMatch(@PathVariable Integer id) {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(matchService.cancelMatch(id, userId));
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<MatchDetailDto> resumeMatch(@PathVariable Integer id) {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(matchService.resumeMatch(id, userId));
    }

    @PostMapping("/{id}/participants/{participantId}/approve")
    public ResponseEntity<MatchDetailDto> approveParticipant(
            @PathVariable Integer id,
            @PathVariable Integer participantId) {
        Integer hostId = SecurityUtils.getCurrentUserId();
        if (hostId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(matchService.approveParticipant(id, participantId, hostId));
    }

    @PostMapping("/{id}/participants/{participantId}/reject")
    public ResponseEntity<MatchDetailDto> rejectParticipant(
            @PathVariable Integer id,
            @PathVariable Integer participantId,
            @RequestBody Map<String, String> payload) {
        Integer hostId = SecurityUtils.getCurrentUserId();
        if (hostId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String reason = payload.get("reason");
        return ResponseEntity.ok(matchService.rejectParticipant(id, participantId, hostId, reason));
    }

    @PostMapping
    public ResponseEntity<?> createMatch(@Valid @RequestBody CreateMatchRequest request) {
        Integer hostId = SecurityUtils.getCurrentUserId();
        if (hostId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Bạn cần đăng nhập để thực hiện chức năng này"));
        }
        Match match = matchService.createMatch(request, hostId);
        return ResponseEntity.ok(match);
    }

    @GetMapping("/my-rooms")
    public ResponseEntity<?> getMyRooms() {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Bạn cần đăng nhập để thực hiện chức năng này"));
        }
        return ResponseEntity.ok(matchService.getMyCreatedMatches(userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateMatchStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Bạn cần đăng nhập để thực hiện chức năng này"));
        }
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
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Bạn cần đăng nhập để thực hiện chức năng này"));
        }
        String description = geminiService.generateMatchDescription(payload);
        return ResponseEntity.ok(Map.of("description", description));
    }
}
