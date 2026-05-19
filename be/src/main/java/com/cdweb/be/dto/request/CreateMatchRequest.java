package com.cdweb.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateMatchRequest {
    @NotBlank
    private String sport;
    private String customSport;
    
    private Integer venueId;
    private String location;
    
    @NotBlank
    private String title;
    
    private String description;
    
    @NotNull
    private LocalDate date;
    
    @NotNull
    private LocalTime startTime;
    
    @NotNull
    private LocalTime endTime;
    
    private String skillLevel;
    
    private Short maxPlayers;
    
    private String feeType;
    private Integer fee;
}
