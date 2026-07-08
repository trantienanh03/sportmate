package com.cdweb.be.controller;

import com.cdweb.be.dto.request.ReportRequestDto;
import com.cdweb.be.service.ReportService;
import com.cdweb.be.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/check")
    public ResponseEntity<?> checkReport(@RequestParam Integer matchId) {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.ok(Map.of("hasReported", false));
        }
        var report = reportService.checkReport(userId, matchId);
        if (report != null) {
            return ResponseEntity.ok(Map.of("hasReported", true, "reportId", report.getId()));
        }
        return ResponseEntity.ok(Map.of("hasReported", false));
    }

    @PostMapping
    public ResponseEntity<?> createReport(@Valid @RequestBody ReportRequestDto request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Bạn cần đăng nhập để gửi báo cáo"));
        }
        
        return ResponseEntity.ok(reportService.createReport(userId, request));
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<?> deleteReport(@PathVariable Long reportId) {
        Integer userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Bạn cần đăng nhập để hoàn tác báo cáo"));
        }
        
        reportService.deleteReport(userId, reportId);
        return ResponseEntity.ok(Map.of("message", "Đã hoàn tác báo cáo thành công"));
    }
}
