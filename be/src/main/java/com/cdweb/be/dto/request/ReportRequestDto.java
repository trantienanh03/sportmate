package com.cdweb.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReportRequestDto {
    private Integer reportedMatchId;
    private Integer reportedUserId;

    @NotBlank(message = "Reason is required")
    private String reason;
    
    private String details;
}
