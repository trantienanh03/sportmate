package com.cdweb.be.service;

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
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.MatchParticipantRepository;
import com.cdweb.be.repository.MatchRepository;
import com.cdweb.be.repository.UserRepository;
import com.cdweb.be.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final MatchParticipantRepository matchParticipantRepository;
    private final UserRepository userRepository;
    private final VenueRepository venueRepository;

    @Transactional(readOnly = true)
    public MatchDetailDto getMatchDetail(Integer matchId, Integer currentUserId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Match not found"));
        return buildMatchDetailDto(match, currentUserId);
    }

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

        if (matchParticipantRepository.existsByMatchIdAndUserId(matchId, userId)) {
            throw new AppException(HttpStatus.CONFLICT, "You have already joined this match");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        MatchParticipant participant = MatchParticipant.builder()
                .match(match)
                .user(user)
                .role("member")
                .status("joined")
                .build();

        matchParticipantRepository.save(participant);
        match.setCurrentPlayers((short) (match.getCurrentPlayers() + 1));
        matchRepository.save(match);

        return buildMatchDetailDto(match, userId);
    }

    @Transactional
    public MatchDetailDto leaveMatch(Integer matchId, Integer userId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Match not found"));

        MatchParticipant participant = matchParticipantRepository
                .findByMatchIdAndUserId(matchId, userId)
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

        return buildMatchDetailDto(match, userId);
    }

    @Transactional
    public Match createMatch(CreateMatchRequest request, Integer hostId) {
        User host = userRepository.findById(hostId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        Venue venue = null;
        if (request.getVenueId() != null) {
            venue = venueRepository.findById(request.getVenueId()).orElse(null);
        }

        Match match = Match.builder()
                .host(host)
                .venue(venue)
                .sport(request.getSport())
                .title(request.getTitle())
                .description(request.getDescription())
                .maxPlayers(request.getMaxPlayers())
                .feePerPerson(request.getFeePerPerson() != null ? request.getFeePerPerson() : 0)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .locationText(request.getLocationText())
                .build();

        return matchRepository.save(match);
    }

    private MatchDetailDto buildMatchDetailDto(Match match, Integer currentUserId) {
        List<MatchParticipant> participants = matchParticipantRepository.findByMatchId(match.getId());

        boolean joined = currentUserId != null &&
                matchParticipantRepository.existsByMatchIdAndUserId(match.getId(), currentUserId);

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
