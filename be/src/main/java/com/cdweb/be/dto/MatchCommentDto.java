package com.cdweb.be.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchCommentDto {
    private Long id;
    private Integer matchId;
    private Integer userId;
    private String userName;
    private String userAvatarUrl;
    private String content;
    private LocalDateTime createdAt;
}
