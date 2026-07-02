package com.cdweb.be.controller.admin;

import com.cdweb.be.dto.response.AdminReportDto;
import com.cdweb.be.entity.Report;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.ReportRepository;
import com.cdweb.be.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reports")
@Slf4j
public class AdminReportController extends AdminBaseController {

    private final ReportRepository reportRepository;
    private final com.cdweb.be.service.NotificationService notificationService;
    private final com.cdweb.be.repository.UserStatRepository userStatRepository;
    private final com.cdweb.be.repository.MatchRepository matchRepository;
    private final com.cdweb.be.repository.MatchParticipantRepository matchParticipantRepository;

    public AdminReportController(UserRepository userRepository, 
                                 ReportRepository reportRepository,
                                 com.cdweb.be.service.NotificationService notificationService,
                                 com.cdweb.be.repository.UserStatRepository userStatRepository,
                                 com.cdweb.be.repository.MatchRepository matchRepository,
                                 com.cdweb.be.repository.MatchParticipantRepository matchParticipantRepository) {
        super(userRepository);
        this.reportRepository = reportRepository;
        this.notificationService = notificationService;
        this.userStatRepository = userStatRepository;
        this.matchRepository = matchRepository;
        this.matchParticipantRepository = matchParticipantRepository;
    }

    @GetMapping
    public ResponseEntity<Page<AdminReportDto>> getReports(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {
        requireAdminId(request);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Report> reportsPage = reportRepository.searchReportsAdmin(keyword, status, pageable);

        Page<AdminReportDto> dtoPage = reportsPage.map(r -> AdminReportDto.builder()
                .id(r.getId())
                .reporterId(r.getReporter().getId())
                .reporterName(r.getReporter().getFullName())
                .reportedUserId(r.getReportedUser() != null ? r.getReportedUser().getId() : null)
                .reportedUserName(r.getReportedUser() != null ? r.getReportedUser().getFullName() : null)
                .reportedMatchId(r.getReportedMatch() != null ? r.getReportedMatch().getId() : null)
                .reportedMatchTitle(r.getReportedMatch() != null ? r.getReportedMatch().getTitle() : null)
                .reason(r.getReason())
                .details(r.getDetails())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .build());

        return ResponseEntity.ok(dtoPage);
    }

    @PutMapping("/{id}/action")
    @Transactional
    public ResponseEntity<String> executeReportAction(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestParam String action, // DISMISS, WARN, PENALTY, BAN, CANCEL_MATCH, LOCK_MATCH, WARN_HOST, BAN_HOST
            @RequestParam(required = false) Integer penaltyScore
    ) {
        requireAdminId(request);

        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy báo cáo"));

        if (!report.getStatus().equals("PENDING")) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Báo cáo này đã được xử lý");
        }

        com.cdweb.be.entity.User reportedUser = report.getReportedUser();
        com.cdweb.be.entity.Match reportedMatch = report.getReportedMatch();
        
        if ("DISMISS".equalsIgnoreCase(action)) {
            report.setStatus("DISMISSED");
            notificationService.sendNotification(report.getReporter().getId(), null,
                "Báo cáo của bạn đã được xem xét",
                "Báo cáo của bạn (lý do: " + report.getReason() + ") đã được xem xét và bác bỏ vì không đủ căn cứ.",
                com.cdweb.be.enums.NotificationType.SYSTEM, null);
        } else if ("CANCEL_MATCH".equalsIgnoreCase(action) || "LOCK_MATCH".equalsIgnoreCase(action)) {
            if (reportedMatch == null) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Hành động 'Hủy/Khóa trận' chỉ áp dụng cho báo cáo trận đấu");
            }
            reportedMatch.setStatus(com.cdweb.be.enums.MatchStatus.cancelled);
            matchRepository.save(reportedMatch);

            try {
                java.util.List<com.cdweb.be.entity.MatchParticipant> participants = matchParticipantRepository.findByMatch_Id(reportedMatch.getId());
                for (com.cdweb.be.entity.MatchParticipant p : participants) {
                    notificationService.sendNotification(
                        p.getUser().getId(), null,
                        "Trận đấu bị khóa do bị báo cáo",
                        "Trận đấu [" + reportedMatch.getTitle() + "] bạn tham gia đã bị Ban Quản Trị khóa/hủy do vi phạm quy định.",
                        com.cdweb.be.enums.NotificationType.MATCH_CANCELLED,
                        reportedMatch.getId()
                    );
                }
            } catch (Exception e) {
                log.error("Lỗi gửi thông báo hủy trận cho thành viên", e);
            }
            report.setStatus("RESOLVED");
        } else if ("WARN_HOST".equalsIgnoreCase(action)) {
            if (reportedMatch == null || reportedMatch.getHost() == null) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Hành động chỉ áp dụng cho báo cáo trận đấu có thông tin người tạo trận");
            }
            notificationService.sendNotification(reportedMatch.getHost().getId(), null,
                "Cảnh cáo từ Ban Quản Trị về Trận Đấu",
                "Trận đấu [" + reportedMatch.getTitle() + "] của bạn đã bị báo cáo vì lý do: " + report.getReason() + ". Vui lòng tuân thủ quy định.",
                com.cdweb.be.enums.NotificationType.SYSTEM, null);
            report.setStatus("RESOLVED");
        } else if ("BAN_HOST".equalsIgnoreCase(action)) {
            if (reportedMatch == null || reportedMatch.getHost() == null) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Hành động chỉ áp dụng cho báo cáo trận đấu có thông tin người tạo trận");
            }
            com.cdweb.be.entity.User host = reportedMatch.getHost();
            host.setIsBanned(true);
            host.setIsActive(false);
            host.setBannedUntil(null);
            userRepository.save(host);

            reportedMatch.setStatus(com.cdweb.be.enums.MatchStatus.cancelled);
            matchRepository.save(reportedMatch);
            report.setStatus("RESOLVED");
        } else if ("WARN".equalsIgnoreCase(action)) {
            if (reportedUser == null) throw new AppException(HttpStatus.BAD_REQUEST, "Hành động 'Cảnh cáo' chỉ áp dụng cho báo cáo người dùng");
            report.setStatus("RESOLVED");
            notificationService.sendNotification(reportedUser.getId(), null, 
                "Cảnh cáo từ Ban Quản Trị", 
                "Bạn đã bị cảnh cáo vì lý do: " + report.getReason() + ". Vui lòng tuân thủ nội quy cộng đồng.", 
                com.cdweb.be.enums.NotificationType.SYSTEM, null);
        } else if ("PENALTY".equalsIgnoreCase(action)) {
            if (reportedUser == null) throw new AppException(HttpStatus.BAD_REQUEST, "Hành động 'Trừ điểm' chỉ áp dụng cho báo cáo người dùng");
            if (penaltyScore == null || penaltyScore <= 0) throw new AppException(HttpStatus.BAD_REQUEST, "Điểm trừ không hợp lệ");
            
            com.cdweb.be.entity.UserStat stat = userStatRepository.findByUserId(reportedUser.getId())
                    .orElseGet(() -> {
                        com.cdweb.be.entity.UserStat newStat = new com.cdweb.be.entity.UserStat();
                        newStat.setUser(reportedUser);
                        return newStat;
                    });
            stat.setReputationScore(Math.max(0, stat.getReputationScore() - penaltyScore));
            userStatRepository.save(stat);
            
            report.setStatus("RESOLVED");
            notificationService.sendNotification(reportedUser.getId(), null, 
                "Thông báo Trừ điểm uy tín", 
                "Bạn đã bị trừ " + penaltyScore + " điểm uy tín vì vi phạm: " + report.getReason() + ".", 
                com.cdweb.be.enums.NotificationType.SYSTEM, null);
        } else if ("BAN".equalsIgnoreCase(action)) {
            if (reportedUser == null) throw new AppException(HttpStatus.BAD_REQUEST, "Hành động 'Khóa tài khoản' chỉ áp dụng cho báo cáo người dùng");
            reportedUser.setIsBanned(true);
            reportedUser.setIsActive(false);
            reportedUser.setBannedUntil(null); // Ban vĩnh viễn
            userRepository.save(reportedUser);
            
            report.setStatus("RESOLVED");
        } else {
            throw new AppException(HttpStatus.BAD_REQUEST, "Hành động không hợp lệ");
        }

        reportRepository.save(report);
        log.info("Admin processed report id: {} with action: {}", id, action);

        return ResponseEntity.ok("Xử lý báo cáo thành công");
    }
}
