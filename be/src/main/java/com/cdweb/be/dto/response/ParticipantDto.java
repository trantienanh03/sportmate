package com.cdweb.be.dto.response;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDto {
    private Integer userId;
    private String fullName;
    private String avatarUrl;
    private String role;
    private String status;
    private List<String> badges;
    private String rejectReason;
}
