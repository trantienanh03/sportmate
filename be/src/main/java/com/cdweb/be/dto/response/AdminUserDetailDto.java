package com.cdweb.be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AdminUserDetailDto {
    private AdminUserDto profile;
    private UserStatDto stats;
    private List<MatchDetailDto> recentMatches;
    private List<FriendDto> friends;

    @Data
    @Builder
    public static class UserStatDto {
        private Integer completedMatches;
        private Integer noShows;
        private Integer reputationScore;
        private Double avgSkillScore;
        private Double avgAttitudeScore;
    }
}
