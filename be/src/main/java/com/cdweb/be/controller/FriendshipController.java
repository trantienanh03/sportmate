package com.cdweb.be.controller;

import com.cdweb.be.dto.response.FriendDto;
import com.cdweb.be.dto.response.FriendshipStatusDto;
import com.cdweb.be.service.FriendshipService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    private Integer getUserIdFromSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            return null;
        }
        return (Integer) session.getAttribute("userId");
    }

    @PostMapping("/request/{userId}")
    public ResponseEntity<?> sendFriendRequest(@PathVariable Integer userId, HttpServletRequest request) {
        Integer myId = getUserIdFromSession(request);
        if (myId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        friendshipService.sendFriendRequest(myId, userId);
        return ResponseEntity.ok(Map.of("message", "Friend request sent"));
    }

    @PostMapping("/accept/{userId}")
    public ResponseEntity<?> acceptFriendRequest(@PathVariable Integer userId, HttpServletRequest request) {
        Integer myId = getUserIdFromSession(request);
        if (myId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        friendshipService.acceptFriendRequest(myId, userId);
        return ResponseEntity.ok(Map.of("message", "Friend request accepted"));
    }

    @PostMapping("/reject/{userId}")
    public ResponseEntity<?> rejectFriendRequest(@PathVariable Integer userId, HttpServletRequest request) {
        Integer myId = getUserIdFromSession(request);
        if (myId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        friendshipService.rejectFriendRequest(myId, userId);
        return ResponseEntity.ok(Map.of("message", "Friend request rejected"));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> unfriend(@PathVariable Integer userId, HttpServletRequest request) {
        Integer myId = getUserIdFromSession(request);
        if (myId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        friendshipService.unfriend(myId, userId);
        return ResponseEntity.ok(Map.of("message", "Unfriended / Request cancelled"));
    }

    @GetMapping
    public ResponseEntity<List<FriendDto>> getMyFriends(HttpServletRequest request) {
        Integer myId = getUserIdFromSession(request);
        if (myId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(friendshipService.getFriends(myId));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<FriendDto>> getPendingRequests(HttpServletRequest request) {
        Integer myId = getUserIdFromSession(request);
        if (myId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(friendshipService.getPendingRequests(myId));
    }

    @GetMapping("/user/{userId}/status")
    public ResponseEntity<FriendshipStatusDto> getFriendshipStatus(@PathVariable Integer userId, HttpServletRequest request) {
        Integer myId = getUserIdFromSession(request);
        if (myId == null) return ResponseEntity.ok(new FriendshipStatusDto("NONE"));

        return ResponseEntity.ok(friendshipService.getFriendshipStatus(myId, userId));
    }

    // For public profile viewing
    @GetMapping("/user/{userId}/list")
    public ResponseEntity<?> getUserFriends(@PathVariable Integer userId, HttpServletRequest request) {
        Integer myId = getUserIdFromSession(request);
        
        if (myId == null || !myId.equals(userId)) {
            // Check if they are friends
            FriendshipStatusDto status = friendshipService.getFriendshipStatus(myId != null ? myId : -1, userId);
            if (!"FRIENDS".equals(status.getStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "You must be friends to view this list."));
            }
        }
        
        return ResponseEntity.ok(friendshipService.getFriends(userId));
    }
}
