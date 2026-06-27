package com.cdweb.be.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminReportDto {
    private Long id;
    private Integer reporterId;
    private String reporterName;
    private Integer reportedUserId;
    private String reportedUserName;
    private Integer reportedMatchId;
    private String reportedMatchTitle;
    private String reason;
    private String details;
    private String status;
    private LocalDateTime createdAt;
}
