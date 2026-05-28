package com.cdweb.be.controller;

import com.cdweb.be.dto.response.VenueDto;
import com.cdweb.be.entity.Venue;
import com.cdweb.be.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueRepository venueRepository;

    @GetMapping
    public ResponseEntity<List<VenueDto>> getAllVenues(
            @RequestParam(required = false) String sport) {

        List<Venue> venues;

        if (sport != null && !sport.isBlank()) {
            // Filter by sport tag if provided
            venues = venueRepository.findAll().stream()
                    .filter(v -> v.getSportTags() != null
                            && v.getSportTags().stream()
                            .anyMatch(tag -> tag.equalsIgnoreCase(sport)))
                    .toList();
        } else {
            venues = venueRepository.findAll();
        }

        List<VenueDto> result = venues.stream()
                .map(this::toDto)
                .toList();

        return ResponseEntity.ok(result);
    }

    private VenueDto toDto(Venue v) {
        return VenueDto.builder()
                .id(v.getId())
                .name(v.getName())
                .address(v.getAddress())
                .district(v.getDistrict())
                .lat(v.getLat())
                .lng(v.getLng())
                .sportTags(v.getSportTags())
                .verified(v.getVerified())
                .googleMapsUrl(v.getGoogleMapsUrl())
                .build();
    }
}
