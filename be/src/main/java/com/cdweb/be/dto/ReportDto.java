package com.cdweb.be.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReportDto {
    private Long id;
    private Integer reporterId;
    private String reporterName;
    private Integer reportedMatchId;
    private Integer reportedUserId;
    private String reason;
    private String details;
    private String status;
    private LocalDateTime createdAt;
}
