package com.cdweb.be.service.impl;

import com.cdweb.be.dto.request.CreateMatchRequest;
import com.cdweb.be.dto.request.ExploreMatchRequest;
import com.cdweb.be.dto.response.HostDto;
import com.cdweb.be.dto.response.MatchDetailDto;
import com.cdweb.be.dto.response.ParticipantDto;
import com.cdweb.be.dto.response.VenueDto;
import com.cdweb.be.entity.Match;
import com.cdweb.be.entity.MatchParticipant;
import com.cdweb.be.entity.User;
import com.cdweb.be.entity.Venue;
import com.cdweb.be.enums.MatchStatus;
import com.cdweb.be.enums.SkillLevel;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.MatchParticipantRepository;
import com.cdweb.be.repository.MatchRepository;
import com.cdweb.be.repository.UserRepository;
import com.cdweb.be.repository.VenueRepository;
import com.cdweb.be.service.MatchService;
import com.cdweb.be.service.RoomService;
import com.cdweb.be.service.NotificationService;
import com.cdweb.be.enums.NotificationType;
import com.cdweb.be.util.BadgeUtil;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchServiceImpl implements MatchService {

    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final MatchParticipantRepository matchParticipantRepository;
    private final com.cdweb.be.service.RoomService roomService;
    private final com.cdweb.be.repository.RoomRepository roomRepository;
    private final com.cdweb.be.repository.RoomMemberRepository roomMemberRepository;
    private final NotificationService notificationService;
    private final com.cdweb.be.repository.UserStatRepository userStatRepository;
    private final com.cdweb.be.repository.ReportRepository reportRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ── Get All Matches ──────────────────────────────────────────────
    @Override
    @Transactional
    public List<MatchDetailDto> getMatches(Integer currentUserId) {
        // Tự động quét và cập nhật trạng thái các trận đấu đã quá giờ bắt đầu sang completed
        checkAndCompleteExpiredMatches();

        // Chỉ hiển thị các trận đấu chưa bắt đầu (startTime > hiện tại) và đang ở trạng thái tuyển người (open/full) trên trang chủ
        List<Match> upcomingMatches = matchRepository.findUpcomingMatches(LocalDateTime.now());
        return buildDtos(upcomingMatches, currentUserId);
    }

    // ── Match Detail ─────────────────────────────────────────────────
    @Override
    @Transactional
    public MatchDetailDto getMatchDetail(Integer matchId, Integer currentUserId) {
        // Trước khi lấy chi tiết, tự động cập nhật trạng thái nếu trận đấu đã quá giờ bắt đầu
        checkAndCompleteExpiredMatches();

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Match not found"));
        return buildDto(match, currentUserId);
    }

    // ── Join Match ───────────────────────────────────────────────────
    @Override
    @Transactional
    public MatchDetailDto joinMatch(Integer matchId, Integer userId) {
        Match match = matchRepository.findByIdForUpdate(matchId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Match not found"));

        refreshStatusByCapacity(match);
        if (match.getStatus() != MatchStatus.open) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Match is not open for joining");
        }
        if (match.getCurrentPlayers() >= match.getMaxPlayers()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Match is full");
        }
        
        boolean isApprovalReq = match.getIsApprovalRequired() != null && match.getIsApprovalRequired();
        String initialStatus = isApprovalReq ? "pending" : "joined";

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        Optional<MatchParticipant> existingOpt = matchParticipantRepository.findByMatch_IdAndUser_Id(matchId, userId);
        if (existingOpt.isPresent()) {
            MatchParticipant existing = existingOpt.get();
            if ("joined".equals(existing.getStatus()) || "pending".equals(existing.getStatus())) {
                throw new AppException(HttpStatus.CONFLICT, "You have already joined this match");
            }
            existing.setStatus(initialStatus);
            existing.setRejectReason(null);
            matchParticipantRepository.save(existing);
        } else {
            matchParticipantRepository.save(MatchParticipant.builder()
                    .match(match).user(user).role("member").status(initialStatus).build());
        }

        if (!isApprovalReq) {
            match.setCurrentPlayers((short) (match.getCurrentPlayers() + 1));
            refreshStatusByCapacity(match);
            matchRepository.save(match);

            // Tự động tham gia phòng chat của match (nếu phòng tồn tại)
            roomRepository.findByMatchId(matchId).ifPresent(room -> {
                roomMemberRepository.findById(new com.cdweb.be.entity.RoomMember.RoomMemberId(room.getId(), userId))
                        .ifPresentOrElse(
                                member -> {
                                    member.setLeftAt(null);
                                    roomMemberRepository.save(member);
                                },
                                () -> {
                                    roomMemberRepository.save(com.cdweb.be.entity.RoomMember.builder()
                                            .roomId(room.getId())
                                            .userId(userId)
                                            .role(com.cdweb.be.enums.MemberRole.MEMBER)
                                            .build());
                                }
                        );
            });
        }

        // Gửi thông báo tới Host của trận đấu
        try {
            if (match.getHost() != null && !match.getHost().getId().equals(userId)) {
                String notifTitle = isApprovalReq ? "yêu cầu tham gia mới (chờ duyệt)" : "thành viên mới tham gia";
                notificationService.sendNotification(
                        match.getHost().getId(),
                        userId,
                        notifTitle,
                        user.getFullName() + " muốn tham gia trận đấu " + match.getTitle() + " của bạn.",
                        NotificationType.MATCH_JOINED,
                        matchId
                );
            }
        } catch (Exception e) {
            log.error("Error sending join match notification for match: {}", matchId, e);
        }

        sendMatchUpdateEvent(matchId);
        return buildDto(match, userId);
    }

    // ── Leave Match ──────────────────────────────────────────────────
    @Override
    @Transactional
    public MatchDetailDto leaveMatch(Integer matchId, Integer userId) {
        Match match = matchRepository.findByIdForUpdate(matchId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Match not found"));

        if (match.getStatus() == MatchStatus.cancelled || match.getStatus() == MatchStatus.completed) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Match is locked and cannot be modified");
        }

        MatchParticipant participant = matchParticipantRepository
                .findByMatch_IdAndUser_Id(matchId, userId)
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "You have not joined this match"));

        if (match.getHost().getId().equals(userId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Host cannot leave the match");
        }

        User user = participant.getUser();

        matchParticipantRepository.delete(participant);
        matchParticipantRepository.flush();

        if ("joined".equals(participant.getStatus())) {
            if (match.getCurrentPlayers() > 0) {
                match.setCurrentPlayers((short) (match.getCurrentPlayers() - 1));
            }

            // Tự động rời phòng chat (soft delete bằng cách ghi nhận thời gian rời)
            roomRepository.findByMatchId(matchId).ifPresent(room -> {
                roomMemberRepository.findByRoomIdAndUserIdAndLeftAtIsNull(room.getId(), userId)
                        .ifPresent(member -> {
                            member.setLeftAt(LocalDateTime.now());
                            roomMemberRepository.save(member);
                        });
            });
        }
        refreshStatusByCapacity(match);
        matchRepository.save(match);

        // Gửi thông báo tới Host của trận đấu
        try {
            if (match.getHost() != null && !match.getHost().getId().equals(userId)) {
                notificationService.sendNotification(
                        match.getHost().getId(),
                        userId,
                        "đã rời trận đấu",
                        user.getFullName() + " đã rời khỏi trận đấu " + match.getTitle() + " của bạn.",
                        NotificationType.MATCH_LEFT,
                        matchId
                );
            }
        } catch (Exception e) {
            log.error("Error sending leave match notification for match: {}", matchId, e);
        }

        sendMatchUpdateEvent(matchId);
        return buildDto(match, userId);
    }

    @Override
    @Transactional
    public MatchDetailDto approveParticipant(Integer matchId, Integer participantUserId, Integer hostId) {
        Match match = matchRepository.findByIdForUpdate(matchId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Match not found"));

        if (!match.getHost().getId().equals(hostId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ Host mới có quyền duyệt");
        }

        MatchParticipant participant = matchParticipantRepository
                .findByMatch_IdAndUser_Id(matchId, participantUserId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Participant not found"));

        if (!"pending".equals(participant.getStatus())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Người dùng này không ở trạng thái chờ duyệt");
        }

        refreshStatusByCapacity(match);
        if (match.getStatus() != MatchStatus.open) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Trận đấu đã đầy hoặc đã đóng");
        }
        if (match.getCurrentPlayers() >= match.getMaxPlayers()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Match is full");
        }

        participant.setStatus("joined");
        matchParticipantRepository.save(participant);

        match.setCurrentPlayers((short) (match.getCurrentPlayers() + 1));
        refreshStatusByCapacity(match);
        matchRepository.save(match);

        // Tham gia phòng chat
        roomRepository.findByMatchId(matchId).ifPresent(room -> {
            roomMemberRepository.findById(new com.cdweb.be.entity.RoomMember.RoomMemberId(room.getId(), participantUserId))
                    .ifPresentOrElse(
                            member -> {
                                member.setLeftAt(null);
                                roomMemberRepository.save(member);
                            },
                            () -> {
                                roomMemberRepository.save(com.cdweb.be.entity.RoomMember.builder()
                                        .roomId(room.getId())
                                        .userId(participantUserId)
                                        .role(com.cdweb.be.enums.MemberRole.MEMBER)
                                        .build());
                            }
                    );
        });

        // Gửi thông báo cho participant
        try {
            notificationService.sendNotification(
                    participantUserId,
                    hostId,
                    "yêu cầu tham gia được duyệt",
                    "Yêu cầu tham gia trận đấu " + match.getTitle() + " của bạn đã được duyệt.",
                    NotificationType.MATCH_JOINED,
                    matchId
            );
        } catch (Exception e) {
            log.error("Error sending approve notification for match: {}", matchId, e);
        }

        sendMatchUpdateEvent(matchId);
        return buildDto(match, hostId);
    }

    @Override
    @Transactional
    public MatchDetailDto rejectParticipant(Integer matchId, Integer participantUserId, Integer hostId, String reason) {
        Match match = matchRepository.findByIdForUpdate(matchId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Match not found"));

        if (!match.getHost().getId().equals(hostId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ Host mới có quyền từ chối");
        }

        MatchParticipant participant = matchParticipantRepository
                .findByMatch_IdAndUser_Id(matchId, participantUserId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Participant not found"));

        if (!"pending".equals(participant.getStatus())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Người dùng này không ở trạng thái chờ duyệt");
        }

        participant.setStatus("rejected");
        participant.setRejectReason(reason);
        matchParticipantRepository.save(participant);

        // Gửi thông báo cho participant
        try {
            notificationService.sendNotification(
                    participantUserId,
                    hostId,
                    "yêu cầu tham gia bị từ chối",
                    "Yêu cầu tham gia trận đấu " + match.getTitle() + " của bạn bị từ chối. Lý do: " + (reason != null && !reason.trim().isEmpty() ? reason : "Không có lý do"),
                    NotificationType.MATCH_REJECTED,
                    matchId
            );
        } catch (Exception e) {
            log.error("Error sending reject notification", e);
        }

        sendMatchUpdateEvent(matchId);
        return buildDto(match, hostId);
    }

    @Override
    @Transactional
    public MatchDetailDto cancelMatch(Integer matchId, Integer hostId) {
        Match match = matchRepository.findByIdForUpdate(matchId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Match not found"));

        if (!match.getHost().getId().equals(hostId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Only host can cancel this match");
        }
        if (match.getStatus() == MatchStatus.cancelled) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Match has already been cancelled");
        }
        if (match.getStatus() == MatchStatus.completed) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Completed match cannot be cancelled");
        }

        match.setStatus(MatchStatus.cancelled);
        matchRepository.save(match);

        // Gửi thông báo tới tất cả thành viên khác tham gia trận đấu
        try {
            List<MatchParticipant> participants = matchParticipantRepository.findByMatch_Id(matchId);
            for (MatchParticipant p : participants) {
                if (!p.getUser().getId().equals(hostId)) {
                    notificationService.sendNotification(
                            p.getUser().getId(),
                            hostId,
                            "đã hủy trận đấu",
                            "Trận đấu " + match.getTitle() + " bạn đã tham gia đã bị hủy bởi Host.",
                            NotificationType.MATCH_CANCELLED,
                            matchId
                    );
                }
            }
        } catch (Exception e) {
            log.error("Error sending match cancellation notifications for match: {}", matchId, e);
        }

        sendMatchUpdateEvent(matchId);
        return buildDto(match, hostId);
    }

    @Override
    @Transactional
    public MatchDetailDto resumeMatch(Integer matchId, Integer hostId) {
        Match match = matchRepository.findByIdForUpdate(matchId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Match not found"));

        if (!match.getHost().getId().equals(hostId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Only host can resume this match");
        }
        if (match.getStatus() != MatchStatus.cancelled) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Only cancelled match can be resumed");
        }

        match.setStatus(MatchStatus.open);
        refreshStatusByCapacity(match);
        matchRepository.save(match);

        // Gửi thông báo tới tất cả thành viên khác tham gia trận đấu
        try {
            List<MatchParticipant> participants = matchParticipantRepository.findByMatch_Id(matchId);
            for (MatchParticipant p : participants) {
                if (!p.getUser().getId().equals(hostId)) {
                    notificationService.sendNotification(
                            p.getUser().getId(),
                            hostId,
                            "đã cập nhật thông tin trận đấu",
                            "Trận đấu bị hủy " + match.getTitle() + " đã được mở lại bởi Host.",
                            NotificationType.MATCH_RESUMED,
                            matchId
                    );
                }
            }
        } catch (Exception e) {
            log.error("Error sending match resumption notifications for match: {}", matchId, e);
        }

        sendMatchUpdateEvent(matchId);
        return buildDto(match, hostId);
    }

    // ── Create Match ─────────────────────────────────────────────────
    @Override
    @Transactional
    public Match createMatch(CreateMatchRequest request, Integer hostId) {
        User host = userRepository.findById(hostId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));

        // Validate & resolve sport → String
        String sportValue = request.getSport();
        if ("other".equalsIgnoreCase(sportValue)) {
            if (!StringUtils.hasText(request.getCustomSport())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng nhập tên môn thể thao tự chọn");
            }
            sportValue = request.getCustomSport().trim();
        }

        // Resolve venue / location
        Venue venue = null;
        String locationText = null;
        if (request.getVenueId() != null) {
            venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy địa điểm"));
        } else if (StringUtils.hasText(request.getLocation())) {
            locationText = request.getLocation();
        } else {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Vui lòng chọn sân chơi hoặc điền thông tin địa điểm");
        }

        // Resolve date + time → LocalDateTime
        LocalDateTime start = LocalDateTime.of(request.getDate(), request.getStartTime());
        LocalDateTime end = request.getEndTime() != null
                ? LocalDateTime.of(request.getDate(), request.getEndTime())
                : null;

        if (start.isBefore(LocalDateTime.now())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Thời gian bắt đầu không thể ở trong quá khứ");
        }
        if (end != null && !end.isAfter(start)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Thời gian kết thúc phải sau thời gian bắt đầu");
        }

        // Resolve fee
        Integer fee = 0;
        if ("paid".equalsIgnoreCase(request.getFeeType())) {
            if (request.getFee() == null) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng cung cấp phí tham gia");
            }
            fee = request.getFee();
        }

        // Resolve skill level
        SkillLevel skillLevel = SkillLevel.beginner;
        if (StringUtils.hasText(request.getSkillLevel())) {
            try {
                skillLevel = SkillLevel.valueOf(request.getSkillLevel().toLowerCase());
            } catch (IllegalArgumentException e) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Mức độ kỹ năng không hợp lệ");
            }
        }

        Match match = Match.builder()
                .host(host)
                .venue(venue)
                .sport(sportValue)
                .customSport("other".equalsIgnoreCase(request.getSport()) ? request.getCustomSport() : null)
                .locationText(locationText)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(MatchStatus.open)
                .skillLevel(skillLevel)
                .maxPlayers(request.getMaxPlayers())
                .currentPlayers((short) 1)
                .feePerPerson(fee)
                .startTime(start)
                .endTime(end)
                .imageUrl(request.getImageUrl())
                .isApprovalRequired(request.getIsApprovalRequired() != null ? request.getIsApprovalRequired() : false)
                .build();

            refreshStatusByCapacity(match);

        Match saved = matchRepository.save(match);

        // Host tự động là participant
        matchParticipantRepository.save(MatchParticipant.builder()
                .match(saved).user(host).role("host").status("joined").build());

        // Tự động tạo room chat cho match vừa tạo
        roomService.createRoomForMatch(saved.getId(), hostId, saved.getTitle());

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatchDetailDto> getMyCreatedMatches(Integer hostId) {
        return buildDtos(matchRepository.findByHostIdOrderByStartTimeDesc(hostId), hostId);
    }

    @Override
    @Transactional
    public MatchDetailDto updateMatchStatus(Integer matchId, MatchStatus status, Integer hostId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy trận đấu"));

        if (!match.getHost().getId().equals(hostId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền cập nhật trạng thái trận đấu này");
        }

        if (match.getStatus() == MatchStatus.cancelled || match.getStatus() == MatchStatus.completed) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Trận đấu đã kết thúc hoặc đã hủy, không thể cập nhật");
        }

        if (status == MatchStatus.cancelled) {
            return cancelMatch(matchId, hostId);
        }

        match.setStatus(status);
        matchRepository.save(match);

        if (status == MatchStatus.completed) {
            try {
                List<MatchParticipant> participants = matchParticipantRepository.findByMatch_Id(matchId);
                for (MatchParticipant participant : participants) {
                    if (!participant.getUser().getId().equals(hostId)) {
                        notificationService.sendNotification(
                                participant.getUser().getId(),
                                hostId,
                                "yêu cầu đánh giá đồng đội",
                                "Trận đấu \"" + match.getTitle() + "\" đã kết thúc. Hãy gửi đánh giá cho những người chơi khác.",
                                NotificationType.MATCH_REVIEW_REQUEST,
                                matchId
                        );
                    }
                }
            } catch (Exception e) {
                log.error("Lỗi gửi thông báo yêu cầu đánh giá trận đấu: ", e);
            }
        }

        return buildDto(match, hostId);
    }

    // ── Explore Matches ──────────────────────────────────────────────
    @Override
    @Transactional
    public List<MatchDetailDto> exploreMatches(ExploreMatchRequest request, Integer currentUserId) {
        // Tự động quét và cập nhật trạng thái các trận đấu đã quá giờ bắt đầu trước khi tìm kiếm
        checkAndCompleteExpiredMatches();
        Double radiusKm = request.getRadiusKm();
        if (radiusKm == null && request.getLat() != null && request.getLng() != null) {
            radiusKm = 10.0; // default 10km when location is provided
        }

        List<Match> matches = matchRepository.exploreMatches(
                request.getKeyword(),
                request.getSport(),
                request.getSkillLevel(),
                request.getFeeType(),
                request.getLat(),
                request.getLng(),
                radiusKm
        );

        List<MatchDetailDto> dtos = buildDtos(matches, currentUserId);

        // Compute distance for each DTO if user coordinates are provided
        if (request.getLat() != null && request.getLng() != null) {
            for (MatchDetailDto dto : dtos) {
                Double matchLat = null;
                Double matchLng = null;
                if (dto.getVenue() != null && dto.getVenue().getLat() != null) {
                    matchLat = dto.getVenue().getLat();
                    matchLng = dto.getVenue().getLng();
                } else if (dto.getLat() != null && dto.getLng() != null) {
                    matchLat = dto.getLat();
                    matchLng = dto.getLng();
                }
                if (matchLat != null && matchLng != null) {
                    dto.setDistance(haversineKm(request.getLat(), request.getLng(), matchLat, matchLng));
                }
            }
        }

        return dtos;
    }

    private double haversineKm(double lat1, double lng1, double lat2, double lng2) {
        double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10.0) / 10.0; // round to 1 decimal
    }

    // ── Internal DTO builder ─────────────────────────────────────────
    private MatchDetailDto buildDto(Match match, Integer currentUserId) {
        List<MatchParticipant> participants =
                matchParticipantRepository.findByMatch_Id(match.getId());

        boolean joined = currentUserId != null &&
                matchParticipantRepository.existsByMatch_IdAndUser_Id(match.getId(), currentUserId);

        return buildDto(match, participants, joined);
    }


    private MatchDetailDto buildDto(Match match, List<MatchParticipant> participants, boolean joined) {
        List<Integer> userIdsToFetch = new java.util.ArrayList<>();
        if (match.getHost() != null) userIdsToFetch.add(match.getHost().getId());
        participants.forEach(p -> userIdsToFetch.add(p.getUser().getId()));
        
        java.util.Map<Integer, com.cdweb.be.entity.UserStat> userStatMap = userStatRepository.findByUserIdIn(userIdsToFetch).stream()
                .collect(Collectors.toMap(stat -> stat.getUser().getId(), stat -> stat));

        List<Object[]> reportCounts = reportRepository.countReportsByUserIds(userIdsToFetch);
        java.util.Map<Integer, Long> userReportCountMap = reportCounts.stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0],
                        row -> ((Number) row[1]).longValue(),
                        (existing, replacement) -> existing
                ));

        return buildDtoWithStats(match, participants, joined, userStatMap, userReportCountMap);
    }

    private MatchDetailDto buildDtoWithStats(Match match, List<MatchParticipant> participants, boolean joined, java.util.Map<Integer, com.cdweb.be.entity.UserStat> userStatMap, java.util.Map<Integer, Long> userReportCountMap) {
        HostDto hostDto = null;
        if (match.getHost() != null) {
            hostDto = HostDto.builder()
                    .id(match.getHost().getId())
                    .fullName(match.getHost().getFullName())
                    .avatarUrl(match.getHost().getAvatarUrl())
                    .badges(BadgeUtil.calculateBadges(
                            userStatMap.get(match.getHost().getId()),
                            userReportCountMap.getOrDefault(match.getHost().getId(), 0L)
                    ))
                    .build();
        }

        VenueDto venueDto = null;
        if (match.getVenue() != null) {
            venueDto = VenueDto.builder()
                    .id(match.getVenue().getId())
                    .name(match.getVenue().getName())
                    .address(match.getVenue().getAddress())
                    .district(match.getVenue().getDistrict())
                    .lat(match.getVenue().getLat())
                    .lng(match.getVenue().getLng())
                    .googleMapsUrl(match.getVenue().getGoogleMapsUrl())
                    .build();
        }

        List<ParticipantDto> participantDtos = participants.stream()
                .map(p -> ParticipantDto.builder()
                        .userId(p.getUser().getId())
                        .fullName(p.getUser().getFullName())
                        .avatarUrl(p.getUser().getAvatarUrl())
                        .role(p.getRole())
                        .status(p.getStatus())
                        .rejectReason(p.getRejectReason())
                        .badges(BadgeUtil.calculateBadges(
                                userStatMap.get(p.getUser().getId()),
                                userReportCountMap.getOrDefault(p.getUser().getId(), 0L)
                        ))
                        .build())
                .collect(Collectors.toList());

        return MatchDetailDto.builder()
                .id(match.getId())
                .title(match.getTitle())
                .sport(match.getSport())
                .description(match.getDescription())
                .status(match.getStatus().name())
                .skillLevel(match.getSkillLevel().name())
                .maxPlayers(match.getMaxPlayers() != null ? match.getMaxPlayers().intValue() : 0)
                .currentPlayers(match.getCurrentPlayers() != null ? match.getCurrentPlayers().intValue() : 0)
                .feePerPerson(match.getFeePerPerson())
                .startTime(match.getStartTime())
                .endTime(match.getEndTime())
                .locationText(match.getLocationText())
                .lat(match.getLat())
                .lng(match.getLng())
                .host(hostDto)
                .venue(venueDto)
                .participants(participantDtos)
                .joined(joined)
                .imageUrl(match.getImageUrl())
                .isApprovalRequired(match.getIsApprovalRequired() != null && match.getIsApprovalRequired())
                .build();
    }

    private List<MatchDetailDto> buildDtos(List<Match> matches, Integer currentUserId) {
        if (matches.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        List<Integer> matchIds = matches.stream().map(Match::getId).collect(Collectors.toList());

        List<MatchParticipant> allParticipants = matchParticipantRepository.findByMatch_IdIn(matchIds);
        java.util.Map<Integer, List<MatchParticipant>> participantsMap = allParticipants.stream()
                .collect(Collectors.groupingBy(p -> p.getMatch().getId()));

        java.util.Set<Integer> joinedMatchIds = new java.util.HashSet<>();
        if (currentUserId != null) {
            joinedMatchIds.addAll(matchParticipantRepository.findJoinedMatchIds(currentUserId, matchIds));
        }

        List<Integer> allUserIds = new java.util.ArrayList<>();
        matches.forEach(m -> {
            if (m.getHost() != null) allUserIds.add(m.getHost().getId());
        });
        allParticipants.forEach(p -> allUserIds.add(p.getUser().getId()));
        java.util.Map<Integer, com.cdweb.be.entity.UserStat> globalUserStatMap = userStatRepository.findByUserIdIn(allUserIds).stream()
                .collect(Collectors.toMap(stat -> stat.getUser().getId(), stat -> stat, (existing, replacement) -> existing));

        List<Object[]> reportCounts = reportRepository.countReportsByUserIds(allUserIds);
        java.util.Map<Integer, Long> globalReportCountMap = reportCounts.stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0],
                        row -> ((Number) row[1]).longValue(),
                        (existing, replacement) -> existing
                ));

        return matches.stream()
                .map(match -> {
                    List<MatchParticipant> participants = participantsMap.getOrDefault(match.getId(), java.util.Collections.emptyList());
                    boolean joined = joinedMatchIds.contains(match.getId());
                    return buildDtoWithStats(match, participants, joined, globalUserStatMap, globalReportCountMap);
                })
                .collect(Collectors.toList());
    }

    /**
     * Tự động quét các trận đấu đã quá giờ bắt đầu (startTime < hiện tại) 
     * nhưng vẫn ở trạng thái open/full để cập nhật sang completed.
     */
    private void checkAndCompleteExpiredMatches() {
        try {
            int updatedCount = matchRepository.autoCompleteExpiredMatches(LocalDateTime.now());
            if (updatedCount > 0) {
                log.info("Auto-completed {} expired matches successfully.", updatedCount);
            }
        } catch (Exception e) {
            log.error("Failed to auto-complete expired matches", e);
        }
    }

    // Lấy lịch trình của người dùng. Trước đó thực hiện tự động hoàn thành các trận đã qua giờ.
    @Override
    @Transactional
    public List<MatchDetailDto> getUserSchedule(Integer userId) {
        checkAndCompleteExpiredMatches();
        List<Match> scheduleMatches = matchRepository.findUserSchedule(userId, LocalDateTime.now());
        return buildDtos(scheduleMatches, userId);
    }

    private void refreshStatusByCapacity(Match match) {
        if (match.getStatus() == MatchStatus.cancelled || match.getStatus() == MatchStatus.completed) {
            return;
        }

        if (match.getCurrentPlayers() >= match.getMaxPlayers()) {
            match.setStatus(MatchStatus.full);
            return;
        }

        match.setStatus(MatchStatus.open);
    }

    private void sendMatchUpdateEvent(Integer matchId) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    doSendMatchUpdateEvent(matchId);
                }
            });
        } else {
            doSendMatchUpdateEvent(matchId);
        }
    }

    private void doSendMatchUpdateEvent(Integer matchId) {
        try {
            messagingTemplate.convertAndSend("/topic/matches/" + matchId, (Object) Map.of("type", "MATCH_UPDATED"));
        } catch (Exception e) {
            log.error("Failed to send socket match update for match {}", matchId, e);
        }
    }
}
