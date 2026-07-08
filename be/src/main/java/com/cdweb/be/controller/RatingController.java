package com.cdweb.be.controller;

import com.cdweb.be.dto.request.RatingRequestDto;
import com.cdweb.be.service.RatingService;
import com.cdweb.be.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @PostMapping("/batch")
    public ResponseEntity<?> submitBatchRatings(@Valid @RequestBody RatingRequestDto request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Bạn cần đăng nhập để đánh giá"));
        }
        
        ratingService.submitBatchRatings(userId, request);
        return ResponseEntity.ok(Map.of("message", "Đã gửi đánh giá thành công"));
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getUnratedParticipantIds(@RequestParam Integer matchId) {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(ratingService.getUnratedParticipantIds(userId, matchId));
    }
    @GetMapping("/my-ratings")
    public ResponseEntity<?> getMyRatings(@RequestParam Integer matchId) {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(ratingService.getMyRatings(userId, matchId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserReviews(@PathVariable Integer userId) {
        return ResponseEntity.ok(ratingService.getUserReviews(userId));
    }
}
