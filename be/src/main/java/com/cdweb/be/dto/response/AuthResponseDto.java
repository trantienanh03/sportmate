package com.cdweb.be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

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
    private Boolean isActive;
    private Boolean isBanned;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
