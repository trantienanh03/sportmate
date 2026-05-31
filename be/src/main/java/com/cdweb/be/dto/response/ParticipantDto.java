package com.cdweb.be.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ParticipantDto {
    private Integer userId;
    private String fullName;
    private String avatarUrl;
    private String role;
    private String status;
}
