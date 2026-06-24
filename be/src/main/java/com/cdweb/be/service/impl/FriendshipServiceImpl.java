package com.cdweb.be.service.impl;

import com.cdweb.be.dto.response.FriendDto;
import com.cdweb.be.dto.response.FriendshipStatusDto;
import com.cdweb.be.entity.Friendship;
import com.cdweb.be.entity.User;
import com.cdweb.be.entity.UserStat;
import com.cdweb.be.enums.NotificationType;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.FriendshipRepository;
import com.cdweb.be.repository.ReportRepository;
import com.cdweb.be.repository.UserRepository;
import com.cdweb.be.repository.UserStatRepository;
import com.cdweb.be.service.FriendshipService;
import com.cdweb.be.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendshipServiceImpl implements FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final UserStatRepository userStatRepository;
    private final ReportRepository reportRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void sendFriendRequest(Integer requesterId, Integer addresseeId) {
        if (requesterId.equals(addresseeId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Bạn không thể gửi lời mời kết bạn cho chính mình");
        }

        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));
        User addressee = userRepository.findById(addresseeId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Target user not found"));

        Optional<Friendship> existing = friendshipRepository.findFriendshipBetween(requesterId, addresseeId);
        if (existing.isPresent()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Friendship or request already exists");
        }

        Friendship friendship = Friendship.builder()
                .requester(requester)
                .addressee(addressee)
                .status("PENDING")
                .build();
        friendshipRepository.save(friendship);

        notificationService.sendNotification(
                addresseeId,
                requesterId,
                "Lời mời kết bạn",
                requester.getFullName() + " đã gửi cho bạn một lời mời kết bạn.",
                NotificationType.FRIEND_REQUEST,
                requesterId
        );
    }

    @Override
    public void acceptFriendRequest(Integer userId, Integer requesterId) {
        Friendship friendship = friendshipRepository.findFriendshipBetween(userId, requesterId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Friend request not found"));

        if (!friendship.getAddressee().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không thể chấp nhận lời mời này");
        }

        if ("ACCEPTED".equals(friendship.getStatus())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Đã là bạn bè");
        }

        friendship.setStatus("ACCEPTED");
        friendshipRepository.save(friendship);

        notificationService.sendNotification(
                requesterId,
                userId,
                "Chấp nhận kết bạn",
                friendship.getAddressee().getFullName() + " đã chấp nhận lời mời kết bạn của bạn.",
                NotificationType.FRIEND_ACCEPTED,
                userId
        );
    }

    @Override
    public void rejectFriendRequest(Integer userId, Integer requesterId) {
        Friendship friendship = friendshipRepository.findFriendshipBetween(userId, requesterId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Friend request not found"));

        if (!friendship.getAddressee().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không thể từ chối lời mời này");
        }

        friendshipRepository.delete(friendship);
        messagingTemplate.convertAndSend("/topic/friends/" + requesterId, "FRIEND_REJECTED");
    }

    @Override
    public void unfriend(Integer userId, Integer friendId) {
        Friendship friendship = friendshipRepository.findFriendshipBetween(userId, friendId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Friendship not found"));

        friendshipRepository.delete(friendship);
        messagingTemplate.convertAndSend("/topic/friends/" + friendId, "FRIEND_REMOVED");
    }

    @Override
    public List<FriendDto> getFriends(Integer userId) {
        List<Friendship> friendships = friendshipRepository.findAcceptedFriendships(userId);
        return friendships.stream().map(f -> mapToDto(f, userId)).collect(Collectors.toList());
    }

    @Override
    public List<FriendDto> getPendingRequests(Integer userId) {
        List<Friendship> friendships = friendshipRepository.findPendingRequestsForUser(userId);
        return friendships.stream().map(f -> mapToDto(f, userId)).collect(Collectors.toList());
    }

    @Override
    public FriendshipStatusDto getFriendshipStatus(Integer myId, Integer targetId) {
        if (myId.equals(targetId)) return new FriendshipStatusDto("NONE");

        Optional<Friendship> fOpt = friendshipRepository.findFriendshipBetween(myId, targetId);
        if (fOpt.isEmpty()) {
            return new FriendshipStatusDto("NONE");
        }

        Friendship f = fOpt.get();
        if ("ACCEPTED".equals(f.getStatus())) {
            return new FriendshipStatusDto("FRIENDS");
        }

        if (f.getRequester().getId().equals(myId)) {
            return new FriendshipStatusDto("PENDING_SENT");
        } else {
            return new FriendshipStatusDto("PENDING_RECEIVED");
        }
    }

    private FriendDto mapToDto(Friendship f, Integer myId) {
        User friend = f.getRequester().getId().equals(myId) ? f.getAddressee() : f.getRequester();
        
        long reportCount = reportRepository.countByReportedUserId(friend.getId());
        UserStat stat = userStatRepository.findByUserId(friend.getId()).orElse(new UserStat());
        List<String> badges = calculateBadges(stat, reportCount);

        return FriendDto.builder()
                .userId(friend.getId())
                .fullName(friend.getFullName())
                .avatarUrl(friend.getAvatarUrl())
                .badges(badges)
                .status(f.getStatus())
                .friendshipId(f.getId())
                .build();
    }

    private List<String> calculateBadges(UserStat stat, long reportCount) {
        List<String> badges = new ArrayList<>();
        
        boolean hasWarning = false;
        if (reportCount >= 3) {
            hasWarning = true;
        }
        if (stat != null && stat.getAvgAttitudeScore() != null && stat.getAvgAttitudeScore() > 0 && stat.getAvgAttitudeScore() < 3.0) {
            hasWarning = true;
        }
        
        if (hasWarning) {
            badges.add("Cảnh báo uy tín");
        }

        if (stat == null) {
            if (!hasWarning) badges.add("Tân binh");
            return badges;
        }
        
        if (stat.getCompletedMatches() != null && stat.getCompletedMatches() < 5) {
            badges.add("Tân binh");
        } else if (stat.getCompletedMatches() != null && stat.getCompletedMatches() >= 5) {
            badges.add("Tích cực");
        }
        
        if (stat.getAvgAttitudeScore() != null && stat.getAvgAttitudeScore() >= 4.5) {
            badges.add("Thân thiện");
        }
        if (stat.getAvgSkillScore() != null && stat.getAvgSkillScore() >= 4.0) {
            badges.add("Chuyên nghiệp");
        }
        
        if (badges.isEmpty() && !hasWarning) {
            badges.add("Tân binh");
        }
        
        return badges;
    }
}
