package com.cdweb.be.controller;

import com.cdweb.be.dto.MatchCommentDto;
import com.cdweb.be.dto.request.MatchCommentRequestDto;
import com.cdweb.be.service.MatchCommentService;
import com.cdweb.be.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchCommentController {

    private final MatchCommentService matchCommentService;

    @GetMapping("/{matchId}/comments")
    public ResponseEntity<List<MatchCommentDto>> getComments(@PathVariable Integer matchId) {
        return ResponseEntity.ok(matchCommentService.getCommentsByMatchId(matchId));
    }

    @PostMapping("/comments")
    public ResponseEntity<?> addComment(@Valid @RequestBody MatchCommentRequestDto request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Bạn cần đăng nhập để bình luận"));
        }
        return ResponseEntity.ok(matchCommentService.addComment(userId, request));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody MatchCommentRequestDto request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Bạn cần đăng nhập để sửa bình luận"));
        }
        return ResponseEntity.ok(matchCommentService.updateComment(userId, commentId, request));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Bạn cần đăng nhập để xóa bình luận"));
        }
        matchCommentService.deleteComment(userId, commentId);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }
}
