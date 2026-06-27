package com.cdweb.be.service;

import com.cdweb.be.dto.response.FriendDto;
import com.cdweb.be.dto.response.FriendshipStatusDto;

import java.util.List;

public interface FriendshipService {
    void sendFriendRequest(Integer requesterId, Integer addresseeId);
    void acceptFriendRequest(Integer userId, Integer requesterId);
    void rejectFriendRequest(Integer userId, Integer requesterId);
    void unfriend(Integer userId, Integer friendId);
    List<FriendDto> getFriends(Integer userId);
    List<FriendDto> getPendingRequests(Integer userId);
    FriendshipStatusDto getFriendshipStatus(Integer myId, Integer targetId);
}
