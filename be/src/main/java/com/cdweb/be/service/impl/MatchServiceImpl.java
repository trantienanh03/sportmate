package com.cdweb.be.service.impl;

import com.cdweb.be.dto.request.CreateMatchRequest;
import com.cdweb.be.dto.response.HostDto;
import com.cdweb.be.dto.response.MatchDetailDto;
import com.cdweb.be.dto.response.ParticipantDto;
import com.cdweb.be.dto.response.VenueDto;
import com.cdweb.be.entity.Match;
import com.cdweb.be.entity.MatchParticipant;
import com.cdweb.be.entity.Sport;
import com.cdweb.be.entity.User;
import com.cdweb.be.entity.Venue;
import com.cdweb.be.enums.MatchStatus;
import com.cdweb.be.enums.SkillLevel;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.MatchParticipantRepository;
import com.cdweb.be.repository.MatchRepository;
import com.cdweb.be.repository.SportRepository;
import com.cdweb.be.repository.UserRepository;
import com.cdweb.be.repository.VenueRepository;
import com.cdweb.be.service.MatchService;
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
    private final SportRepository sportRepository;
    private final VenueRepository venueRepository;
    private final MatchParticipantRepository matchParticipantRepository;

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
        String sportValue;
        if ("other".equalsIgnoreCase(request.getSport())) {
            if (!StringUtils.hasText(request.getCustomSport())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng nhập tên môn thể thao tự chọn");
            }
            sportValue = request.getCustomSport();
        } else {
            Sport sport = sportRepository.findBySlug(request.getSport())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                            "Không tìm thấy môn thể thao: " + request.getSport()));
            sportValue = sport.getName();
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
        LocalDateTime end   = request.getEndTime() != null
                ? LocalDateTime.of(request.getDate(), request.getEndTime()) : null;

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

        return saved;
    }

    // ── Internal DTO builder ─────────────────────────────────────────
    private MatchDetailDto buildDto(Match match, Integer currentUserId) {
        List<MatchParticipant> participants =
                matchParticipantRepository.findByMatch_Id(match.getId());

        boolean joined = currentUserId != null &&
                matchParticipantRepository.existsByMatch_IdAndUser_Id(match.getId(), currentUserId);

        HostDto hostDto = HostDto.builder()
                .id(match.getHost().getId())
                .fullName(match.getHost().getFullName())
                .avatarUrl(match.getHost().getAvatarUrl())
                .build();

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
}
