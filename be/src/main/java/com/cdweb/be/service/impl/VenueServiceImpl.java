package com.cdweb.be.service.impl;

import com.cdweb.be.dto.response.VenueDto;
import com.cdweb.be.entity.Venue;
import com.cdweb.be.repository.VenueRepository;
import com.cdweb.be.service.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VenueServiceImpl implements VenueService {

    private final VenueRepository venueRepository;

    @Override
    @Transactional(readOnly = true)
    public List<VenueDto> getAllVenues(String sport) {
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

        return venues.stream()
                .map(this::toDto)
                .toList();
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
