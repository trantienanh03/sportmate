package com.cdweb.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponseDto {
    private Integer id;
    private HostDto host;
    private String sport;
    private VenueDto venue;
    private String customSport;
    private String locationText;
    private String title;
    private String description;
    private String status;
    private String skillLevel;
    private Short maxPlayers;
    private Short currentPlayers;
    private Integer feePerPerson;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double lat;
    private Double lng;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
