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
public class RoomSummaryDto {
    private Integer id;
    private String name;
    private String type;           // "GROUP" | "DIRECT"
    private Integer matchId;
    private Integer participantCount;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;
}
