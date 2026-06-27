package com.cdweb.be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminDashboardDto {
    private long totalUsers;
    private long matchesToday;
    private double fillRate;
    private long pendingReports;
    private long newUsersToday;
    private long newUsersThisWeek;
    private long completedMatchesToday;
    private long newReportsToday;
    private List<ChartDataDto> userGrowthChart;
    private List<ChartDataDto> matchGrowthChart;
    private List<ChartDataDto> popularSportsChart;
    private List<RecentActivityDto> recentActivities;
}
