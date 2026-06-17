package com.cdweb.be.service.impl;

import com.cdweb.be.dto.ReportDto;
import com.cdweb.be.dto.request.ReportRequestDto;
import com.cdweb.be.entity.Match;
import com.cdweb.be.entity.Report;
import com.cdweb.be.entity.User;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.MatchRepository;
import com.cdweb.be.repository.ReportRepository;
import com.cdweb.be.repository.UserRepository;
import com.cdweb.be.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final MatchRepository matchRepository;

    @Override
    @Transactional(readOnly = true)
    public ReportDto checkReport(Integer reporterId, Integer matchId) {
        return reportRepository.findByReporterIdAndReportedMatchId(reporterId, matchId)
                .map(report -> ReportDto.builder().id(report.getId()).build())
                .orElse(null);
    }

    @Override
    @Transactional
    public ReportDto createReport(Integer reporterId, ReportRequestDto request) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Reporter not found"));

        Report.ReportBuilder reportBuilder = Report.builder()
                .reporter(reporter)
                .reason(request.getReason())
                .details(request.getDetails())
                .status("PENDING");

        if (request.getReportedMatchId() != null) {
            if (reportRepository.findByReporterIdAndReportedMatchId(reporterId, request.getReportedMatchId()).isPresent()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Bạn đã báo cáo trận đấu này rồi");
            }
            Match match = matchRepository.findById(request.getReportedMatchId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Match not found"));
            reportBuilder.reportedMatch(match);
        }

        if (request.getReportedUserId() != null) {
            User reportedUser = userRepository.findById(request.getReportedUserId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Reported user not found"));
            reportBuilder.reportedUser(reportedUser);
        }

        Report savedReport = reportRepository.save(reportBuilder.build());

        return ReportDto.builder()
                .id(savedReport.getId())
                .reporterId(savedReport.getReporter().getId())
                .reporterName(savedReport.getReporter().getFullName())
                .reportedMatchId(savedReport.getReportedMatch() != null ? savedReport.getReportedMatch().getId() : null)
                .reportedUserId(savedReport.getReportedUser() != null ? savedReport.getReportedUser().getId() : null)
                .reason(savedReport.getReason())
                .details(savedReport.getDetails())
                .status(savedReport.getStatus())
                .createdAt(savedReport.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public void deleteReport(Integer reporterId, Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Report not found"));

        if (!report.getReporter().getId().equals(reporterId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You do not have permission to delete this report");
        }

        reportRepository.delete(report);
    }
}
