package com.cdweb.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FriendshipStatusDto {
    private String status; // NONE, PENDING_SENT, PENDING_RECEIVED, FRIENDS
}
