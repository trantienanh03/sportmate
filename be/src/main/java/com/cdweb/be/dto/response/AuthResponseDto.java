package com.cdweb.be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import com.cdweb.be.dto.profile.SportCardDto;
import com.cdweb.be.dto.profile.AvailabilitySlotDto;

@Data
@Builder
public class AuthResponseDto {
    private Integer id;
    private String fullName;
    private String email;
    private String role;
    private String avatarUrl;
    private String bio;
    private String district;
    private Double lat;
    private Double lng;
    private List<SportCardDto> sports;
    private List<AvailabilitySlotDto> availability;
    private Boolean isActive;
    private Boolean isBanned;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
