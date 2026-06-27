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
public class RecentActivityDto {
    private String type; // "NEW_USER" or "NEW_MATCH"
    private String name;
    private String description;
    private String avatarUrl;
    private LocalDateTime timestamp;
}
