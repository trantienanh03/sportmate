package com.cdweb.be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserReviewDto {
    private String reviewerName;
    private String reviewerAvatarUrl;
    private String matchSport;
    private Integer ratingScore;
    private String comment;
    private LocalDateTime createdAt;
}
