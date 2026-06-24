package com.cdweb.be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class MatchDetailDto {
    private Integer id;
    private String title;
    private String sport;
    private String description;
    private String status;
    private String skillLevel;
    private Integer maxPlayers;
    private Integer currentPlayers;
    private Integer feePerPerson;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String locationText;
    private Double lat;
    private Double lng;
    private HostDto host;
    private VenueDto venue;
    private List<ParticipantDto> participants;
    private boolean joined;
    private String imageUrl;
    private Double distance; // km from user, null when no coordinates
}
