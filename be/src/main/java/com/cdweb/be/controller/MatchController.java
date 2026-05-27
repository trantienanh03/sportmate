package com.cdweb.be.controller;

import com.cdweb.be.dto.response.MatchDetailDto;
import com.cdweb.be.service.MatchService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    /**
     * GET /api/matches/{id}
     * Session optional — returns joined=false for unauthenticated users.
     */
    @GetMapping("/{id}")
    public ResponseEntity<MatchDetailDto> getMatch(
            @PathVariable Integer id,
            HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        Integer userId = null;
        if (session != null) {
            userId = (Integer) session.getAttribute("userId");
        }
        return ResponseEntity.ok(matchService.getMatchDetail(id, userId));
    }

    /**
     * POST /api/matches/{id}/join
     * Requires active session — returns 401 if not logged in.
     */
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

    /**
     * DELETE /api/matches/{id}/join
     * Requires active session — returns 401 if not logged in.
     */
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
}
