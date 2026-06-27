package com.cdweb.be.controller.admin;

import com.cdweb.be.dto.response.AdminDashboardDto;
import com.cdweb.be.dto.response.ChartDataDto;
import com.cdweb.be.dto.response.RecentActivityDto;
import java.util.stream.Collectors;
import java.util.List;
import java.util.ArrayList;
import com.cdweb.be.repository.MatchRepository;
import com.cdweb.be.repository.ReportRepository;
import com.cdweb.be.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@Slf4j
public class AdminDashboardController extends AdminBaseController {

    private final MatchRepository matchRepository;
    private final ReportRepository reportRepository;

    public AdminDashboardController(UserRepository userRepository, MatchRepository matchRepository, ReportRepository reportRepository) {
        super(userRepository);
        this.matchRepository = matchRepository;
        this.reportRepository = reportRepository;
    }

    @GetMapping
    public ResponseEntity<AdminDashboardDto> getDashboardData(HttpServletRequest request) {
        requireAdminId(request);

        long totalUsers = userRepository.count();
        long matchesToday = matchRepository.countMatchesCreatedToday();
        long pendingReports = reportRepository.countByStatus("PENDING");
        
        Double avgFillRate = matchRepository.getAverageFillRate();
        double fillRate = avgFillRate != null ? Math.round(avgFillRate * 100.0) / 100.0 : 0.0;

        List<ChartDataDto> userGrowthChart = userRepository.countUsersByMonth().stream()
                .map(row -> new ChartDataDto((String) row[0], ((Number) row[1]).longValue()))
                .collect(Collectors.toList());

        List<ChartDataDto> matchGrowthChart = matchRepository.countMatchesByMonth().stream()
                .map(row -> new ChartDataDto((String) row[0], ((Number) row[1]).longValue()))
                .collect(Collectors.toList());

        List<ChartDataDto> popularSportsChart = matchRepository.countMatchesBySport().stream()
                .map(row -> new ChartDataDto((String) row[0], ((Number) row[1]).longValue()))
                .collect(Collectors.toList());

        List<RecentActivityDto> recentActivities = new ArrayList<>();
        
        userRepository.findTop5ByOrderByCreatedAtDesc().forEach(u -> {
            recentActivities.add(RecentActivityDto.builder()
                    .type("NEW_USER")
                    .name(u.getFullName())
                    .description("Người dùng mới vừa đăng ký tài khoản")
                    .avatarUrl(u.getAvatarUrl())
                    .timestamp(u.getCreatedAt())
                    .build());
        });
        
        matchRepository.findTop5ByOrderByCreatedAtDesc().forEach(m -> {
            recentActivities.add(RecentActivityDto.builder()
                    .type("NEW_MATCH")
                    .name(m.getTitle())
                    .description("Trận đấu mới môn " + m.getSport())
                    .avatarUrl(m.getHost().getAvatarUrl())
                    .timestamp(m.getCreatedAt())
                    .build());
        });

        // Sắp xếp lại tổng hợp và lấy 5 cái mới nhất
        recentActivities.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        List<RecentActivityDto> topRecentActivities = recentActivities.stream().limit(5).collect(Collectors.toList());

        long newUsersToday = userRepository.countUsersCreatedToday();
        long newUsersThisWeek = userRepository.countUsersCreatedThisWeek();
        long completedMatchesToday = matchRepository.countCompletedMatchesToday();
        long newReportsToday = reportRepository.countReportsCreatedToday();

        AdminDashboardDto dashboardDto = AdminDashboardDto.builder()
                .totalUsers(totalUsers)
                .matchesToday(matchesToday)
                .fillRate(fillRate)
                .pendingReports(pendingReports)
                .newUsersToday(newUsersToday)
                .newUsersThisWeek(newUsersThisWeek)
                .completedMatchesToday(completedMatchesToday)
                .newReportsToday(newReportsToday)
                .userGrowthChart(userGrowthChart)
                .matchGrowthChart(matchGrowthChart)
                .popularSportsChart(popularSportsChart)
                .recentActivities(topRecentActivities)
                .build();

        return ResponseEntity.ok(dashboardDto);
    }
}
