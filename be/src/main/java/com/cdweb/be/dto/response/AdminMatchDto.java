package com.cdweb.be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminMatchDto {
    private Integer id;
    private String title;
    private String sport;
    private String hostName;
    private Integer hostId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer currentParticipants;
    private Integer maxParticipants;
    private String status;
    private LocalDateTime createdAt;
}
