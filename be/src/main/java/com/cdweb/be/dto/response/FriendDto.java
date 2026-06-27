package com.cdweb.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendDto {
    private Integer userId;
    private String fullName;
    private String avatarUrl;
    private List<String> badges;
    private String status; // PENDING or ACCEPTED
    private Integer friendshipId;
}
