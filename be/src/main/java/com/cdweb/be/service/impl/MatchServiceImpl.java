package com.cdweb.be.service.impl;

import com.cdweb.be.dto.request.CreateMatchRequest;
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
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final MatchParticipantRepository matchParticipantRepository;
    private final RoomService roomService;

    // ── Get All Matches ──────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<MatchDetailDto> getMatches(Integer currentUserId) {
        return buildDtos(matchRepository.findAll(), currentUserId);
    }

    // ── Match Detail ─────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public MatchDetailDto getMatchDetail(Integer matchId, Integer currentUserId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Match not found"));
        return buildDto(match, currentUserId);
    }

    // ── Join Match ───────────────────────────────────────────────────
    @Override
    @Transactional
    public MatchDetailDto joinMatch(Integer matchId, Integer userId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Match not found"));

        if (match.getStatus() != MatchStatus.open) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Match is not open for joining");
        }
        if (match.getCurrentPlayers() >= match.getMaxPlayers()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Match is full");
        }
        if (matchParticipantRepository.existsByMatch_IdAndUser_Id(matchId, userId)) {
            throw new AppException(HttpStatus.CONFLICT, "You have already joined this match");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        matchParticipantRepository.save(MatchParticipant.builder()
                .match(match).user(user).role("member").status("joined").build());

        match.setCurrentPlayers((short) (match.getCurrentPlayers() + 1));
        matchRepository.save(match);

        return buildDto(match, userId);
    }

    // ── Leave Match ──────────────────────────────────────────────────
    @Override
    @Transactional
    public MatchDetailDto leaveMatch(Integer matchId, Integer userId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Match not found"));

        MatchParticipant participant = matchParticipantRepository
                .findByMatch_IdAndUser_Id(matchId, userId)
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "You have not joined this match"));

        if (match.getHost().getId().equals(userId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Host cannot leave the match");
        }

        matchParticipantRepository.delete(participant);
        matchParticipantRepository.flush();

        if (match.getCurrentPlayers() > 0) {
            match.setCurrentPlayers((short) (match.getCurrentPlayers() - 1));
            matchRepository.save(match);
        }

        return buildDto(match, userId);
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
                .build();

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

        match.setStatus(status);
        matchRepository.save(match);

        return buildDto(match, hostId);
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
        HostDto hostDto = null;
        if (match.getHost() != null) {
            hostDto = HostDto.builder()
                    .id(match.getHost().getId())
                    .fullName(match.getHost().getFullName())
                    .avatarUrl(match.getHost().getAvatarUrl())
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

        return matches.stream()
                .map(match -> {
                    List<MatchParticipant> participants = participantsMap.getOrDefault(match.getId(), java.util.Collections.emptyList());
                    boolean joined = joinedMatchIds.contains(match.getId());
                    return buildDto(match, participants, joined);
                })
                .collect(Collectors.toList());
    }
}
