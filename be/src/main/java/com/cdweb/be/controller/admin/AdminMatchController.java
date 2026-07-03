package com.cdweb.be.controller.admin;

import com.cdweb.be.dto.response.AdminMatchDto;
import com.cdweb.be.entity.Match;
import com.cdweb.be.enums.MatchStatus;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.MatchRepository;
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
@RequestMapping("/api/admin/matches")
@Slf4j
public class AdminMatchController extends AdminBaseController {

    private final MatchRepository matchRepository;
    private final com.cdweb.be.service.NotificationService notificationService;
    private final com.cdweb.be.repository.MatchParticipantRepository matchParticipantRepository;

    public AdminMatchController(UserRepository userRepository, 
                                MatchRepository matchRepository,
                                com.cdweb.be.service.NotificationService notificationService,
                                com.cdweb.be.repository.MatchParticipantRepository matchParticipantRepository) {
        super(userRepository);
        this.matchRepository = matchRepository;
        this.notificationService = notificationService;
        this.matchParticipantRepository = matchParticipantRepository;
    }

    @GetMapping
    public ResponseEntity<Page<AdminMatchDto>> getMatches(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status
    ) {
        requireAdminId(request);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Match> matchesPage = matchRepository.searchMatchesAdmin(keyword, status, pageable);

        Page<AdminMatchDto> dtoPage = matchesPage.map(m -> {
            return AdminMatchDto.builder()
                    .id(m.getId())
                    .title(m.getTitle())
                    .sport(m.getSport())
                    .hostName(m.getHost() != null ? m.getHost().getFullName() : "Unknown")
                    .hostId(m.getHost() != null ? m.getHost().getId() : 0)
                    .startTime(m.getStartTime())
                    .endTime(m.getEndTime())
                    .currentParticipants(m.getCurrentPlayers() != null ? m.getCurrentPlayers().intValue() : 1)
                    .maxParticipants(m.getMaxPlayers() != null ? m.getMaxPlayers().intValue() : 1)
                    .status(m.getStatus() != null ? m.getStatus().name() : "open")
                    .createdAt(m.getCreatedAt())
                    .build();
        });

        return ResponseEntity.ok(dtoPage);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<String> cancelMatch(
            HttpServletRequest request,
            @PathVariable Integer id
    ) {
        requireAdminId(request);

        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy trận đấu"));

        if (match.getStatus() == MatchStatus.completed || match.getStatus() == MatchStatus.cancelled) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Không thể hủy trận đấu đã kết thúc hoặc đã hủy");
        }

        match.setStatus(MatchStatus.cancelled);
        matchRepository.save(match);
        log.info("Admin cancelled match id: {}", id);

        try {
            java.util.List<com.cdweb.be.entity.MatchParticipant> participants = matchParticipantRepository.findByMatch_Id(id);
            for (com.cdweb.be.entity.MatchParticipant p : participants) {
                notificationService.sendNotification(
                        p.getUser().getId(),
                        null,
                        "Trận đấu bị hủy bởi Admin",
                        "Trận đấu " + match.getTitle() + " bạn đã tham gia bị hủy bởi Quản trị viên (Admin) do vi phạm quy định.",
                        com.cdweb.be.enums.NotificationType.MATCH_CANCELLED,
                        id
                );
            }
        } catch (Exception e) {
            log.error("Error sending match cancellation notifications for match: {}", id, e);
        }

        return ResponseEntity.ok("Đã hủy trận đấu");
    }
}
