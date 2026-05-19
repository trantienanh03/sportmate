package com.cdweb.be.service.impl;

import com.cdweb.be.dto.request.CreateMatchRequest;
import com.cdweb.be.entity.Match;
import com.cdweb.be.entity.MatchParticipant;
import com.cdweb.be.entity.Sport;
import com.cdweb.be.entity.User;
import com.cdweb.be.entity.Venue;
import com.cdweb.be.enums.MatchStatus;
import com.cdweb.be.enums.SkillLevel;
import com.cdweb.be.repository.MatchParticipantRepository;
import com.cdweb.be.repository.MatchRepository;
import com.cdweb.be.repository.SportRepository;
import com.cdweb.be.repository.UserRepository;
import com.cdweb.be.repository.VenueRepository;
import com.cdweb.be.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final SportRepository sportRepository;
    private final VenueRepository venueRepository;
    private final MatchParticipantRepository matchParticipantRepository;

    @Override
    @Transactional
    public Match createMatch(CreateMatchRequest request, Integer hostId) {
        // 1. Validate Host
        User host = userRepository.findById(hostId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Validate Sport
        Sport sport = null;
        String customSport = null;
        if ("other".equalsIgnoreCase(request.getSport())) {
            // Find a generic "other" sport record or handle appropriately
            sport = sportRepository.findBySlug("other").orElse(null);
            customSport = request.getCustomSport();
        } else {
            sport = sportRepository.findBySlug(request.getSport())
                    .orElseThrow(() -> new RuntimeException("Sport not found: " + request.getSport()));
        }

        // 3. Validate Venue/Location
        Venue venue = null;
        String locationText = null;
        if (request.getVenueId() != null) {
            venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new RuntimeException("Venue not found"));
        } else {
            locationText = request.getLocation();
        }

        // 4. Handle Fee
        Integer fee = 0;
        if ("paid".equalsIgnoreCase(request.getFeeType()) && request.getFee() != null) {
            fee = request.getFee();
        }

        // 5. Handle Skill Level mapping
        SkillLevel skillLevel = SkillLevel.beginner;
        try {
            if (request.getSkillLevel() != null) {
                skillLevel = SkillLevel.valueOf(request.getSkillLevel().toLowerCase());
            }
        } catch (Exception e) {
            // Fallback to beginner
        }

        LocalDateTime start = LocalDateTime.of(request.getDate(), request.getStartTime());
        LocalDateTime end = LocalDateTime.of(request.getDate(), request.getEndTime());

        // 6. Build and Save Match
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
                .build();

        Match savedMatch = matchRepository.save(match);

        // 7. Add Host as a Participant automatically
        MatchParticipant participant = MatchParticipant.builder()
                .match(savedMatch)
                .user(host)
                .role("host")
                .status("joined")
                .build();
        matchParticipantRepository.save(participant);

        return savedMatch;
    }
}
