package com.cdweb.be.service.impl;

import com.cdweb.be.dto.request.CreateMatchRequest;
import com.cdweb.be.dto.response.HostDto;
import com.cdweb.be.dto.response.MatchResponseDto;
import com.cdweb.be.dto.response.VenueDto;
import com.cdweb.be.entity.Match;
import com.cdweb.be.entity.MatchParticipant;
import com.cdweb.be.entity.User;
import com.cdweb.be.entity.Venue;
import com.cdweb.be.enums.MatchStatus;
import com.cdweb.be.enums.SkillLevel;
import com.cdweb.be.repository.MatchParticipantRepository;
import com.cdweb.be.repository.MatchRepository;
import com.cdweb.be.repository.UserRepository;
import com.cdweb.be.repository.VenueRepository;
import com.cdweb.be.service.MatchService;
import lombok.RequiredArgsConstructor;
import com.cdweb.be.exception.AppException;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final MatchParticipantRepository matchParticipantRepository;

    @Override
    @Transactional
    public Match createMatch(CreateMatchRequest request, Integer hostId) {
        // 1. Validate Host
        User host = userRepository.findById(hostId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với ID: " + hostId));

        // 2. Validate Sport
        String sport = request.getSport();
        String customSport = null;
        if ("other".equalsIgnoreCase(sport)) {
            if (!StringUtils.hasText(request.getCustomSport())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng nhập tên môn thể thao tự chọn (customSport) khi chọn môn thể thao là 'other'");
            }
            customSport = request.getCustomSport().trim();
            sport = customSport;
        }

        // 3. Validate Venue/Location
        Venue venue = null;
        String locationText = null;
        if (request.getVenueId() != null) {
            venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy địa điểm (Sân chơi) yêu cầu"));
        } else if (StringUtils.hasText(request.getLocation())) {
            locationText = request.getLocation();
        } else {
            throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng chọn sân chơi (venueId) hoặc điền thông tin địa điểm chơi (location)");
        }

        // 4. Validate and Handle Time
        LocalDateTime start = LocalDateTime.of(request.getDate(), request.getStartTime());
        LocalDateTime end = LocalDateTime.of(request.getDate(), request.getEndTime());

        if (start.isBefore(LocalDateTime.now())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Thời gian bắt đầu trận đấu không thể ở trong quá khứ");
        }
        if (!end.isAfter(start)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Thời gian kết thúc trận đấu phải diễn ra sau thời gian bắt đầu");
        }

        // 5. Handle Fee
        Integer fee = 0;
        if ("paid".equalsIgnoreCase(request.getFeeType())) {
            if (request.getFee() == null) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng cung cấp số tiền phí khi chọn loại trận đấu có phí (paid)");
            }
            fee = request.getFee();
        }

        // 6. Handle Skill Level mapping
        SkillLevel skillLevel = SkillLevel.beginner;
        if (request.getSkillLevel() != null) {
            try {
                skillLevel = SkillLevel.valueOf(request.getSkillLevel().toLowerCase());
            } catch (IllegalArgumentException e) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Mức độ kỹ năng không hợp lệ. Các giá trị hợp lệ gồm: newbie, beginner, intermediate, advanced, all");
            }
        }

        // 7. Build and Save Match
        Match match = Match.builder()
                .host(host)
                .sport(sport)
                .venue(venue)
                .customSport(customSport)
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
                .build();

        Match savedMatch = matchRepository.save(match);

        // 8. Add Host as a Participant automatically
        MatchParticipant participant = MatchParticipant.builder()
                .match(savedMatch)
                .user(host)
                .role("host")
                .status("joined")
                .build();
        matchParticipantRepository.save(participant);

        return savedMatch;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatchResponseDto> getAllMatches() {
        return matchRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::convertToResponseDto)
                .toList();
    }

    private MatchResponseDto convertToResponseDto(Match match) {
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
                    .build();
        }

        return MatchResponseDto.builder()
                .id(match.getId())
                .host(hostDto)
                .sport(match.getSport())
                .venue(venueDto)
                .customSport(match.getCustomSport())
                .locationText(match.getLocationText())
                .title(match.getTitle())
                .description(match.getDescription())
                .status(match.getStatus() != null ? match.getStatus().name() : null)
                .skillLevel(match.getSkillLevel() != null ? match.getSkillLevel().name() : null)
                .maxPlayers(match.getMaxPlayers())
                .currentPlayers(match.getCurrentPlayers())
                .feePerPerson(match.getFeePerPerson())
                .startTime(match.getStartTime())
                .endTime(match.getEndTime())
                .lat(match.getLat())
                .lng(match.getLng())
                .imageUrl(match.getImageUrl())
                .createdAt(match.getCreatedAt())
                .updatedAt(match.getUpdatedAt())
                .build();
    }
}
