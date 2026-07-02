package com.cdweb.be.controller.admin;

import com.cdweb.be.dto.response.AdminUserDto;
import com.cdweb.be.entity.User;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@Slf4j
public class AdminUserController extends AdminBaseController {

    private final com.cdweb.be.repository.UserStatRepository userStatRepository;
    private final com.cdweb.be.repository.MatchRepository matchRepository;
    private final com.cdweb.be.repository.FriendshipRepository friendshipRepository;
    private final com.cdweb.be.service.NotificationService notificationService;

    public AdminUserController(UserRepository userRepository, 
                               com.cdweb.be.repository.UserStatRepository userStatRepository,
                               com.cdweb.be.repository.MatchRepository matchRepository,
                               com.cdweb.be.repository.FriendshipRepository friendshipRepository,
                               com.cdweb.be.service.NotificationService notificationService) {
        super(userRepository);
        this.userStatRepository = userStatRepository;
        this.matchRepository = matchRepository;
        this.friendshipRepository = friendshipRepository;
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<Page<AdminUserDto>> getUsers(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status, // "ACTIVE" or "BANNED"
            @RequestParam(required = false) String role // "admin" or "user"
    ) {
        requireAdminId(request);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> usersPage = userRepository.searchUsers(keyword, status, role, pageable);
        
        Page<AdminUserDto> dtoPage = usersPage.map(user -> AdminUserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().name() : "user")
                .avatarUrl(user.getAvatarUrl())
                .isActive(user.getIsActive())
                .isBanned(user.getIsBanned())
                .bannedUntil(user.getBannedUntil())
                .createdAt(user.getCreatedAt())
                .build());
                
        return ResponseEntity.ok(dtoPage);
    }

    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<String> toggleUserStatus(
            HttpServletRequest request,
            @PathVariable Integer id,
            @RequestParam String action // "BAN_7_DAYS", "BAN_30_DAYS", "BAN_PERMANENT", "UNBAN"
    ) {
        requireAdminId(request);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
                
        if ("BAN_7_DAYS".equalsIgnoreCase(action)) {
            user.setIsBanned(true);
            user.setIsActive(false);
            user.setBannedUntil(java.time.LocalDateTime.now().plusDays(7));
            log.info("Admin banned user id: {} for 7 days", id);

            notificationService.sendNotification(
                user.getId(), null,
                "Tài khoản của bạn đã bị khóa tạm thời!",
                "Tài khoản của bạn đã bị khóa 7 ngày (đến ngày " + user.getBannedUntil().toLocalDate() + ") do vi phạm quy định cộng đồng. Bạn có thể gửi đơn kháng cáo nếu cho rằng đây là nhầm lẫn.",
                com.cdweb.be.enums.NotificationType.ACCOUNT_BANNED, null
            );
        } else if ("BAN_30_DAYS".equalsIgnoreCase(action)) {
            user.setIsBanned(true);
            user.setIsActive(false);
            user.setBannedUntil(java.time.LocalDateTime.now().plusDays(30));
            log.info("Admin banned user id: {} for 30 days", id);

            notificationService.sendNotification(
                user.getId(), null,
                "Tài khoản của bạn đã bị khóa tạm thời!",
                "Tài khoản của bạn đã bị khóa 30 ngày (đến ngày " + user.getBannedUntil().toLocalDate() + ") do vi phạm quy định cộng đồng. Bạn có thể gửi đơn kháng cáo nếu cho rằng đây là nhầm lẫn.",
                com.cdweb.be.enums.NotificationType.ACCOUNT_BANNED, null
            );
        } else if ("BAN_PERMANENT".equalsIgnoreCase(action)) {
            user.setIsBanned(true);
            user.setIsActive(false);
            user.setBannedUntil(null); // Vĩnh viễn
            log.info("Admin permanently banned user id: {}", id);

            notificationService.sendNotification(
                user.getId(), null,
                "Tài khoản của bạn đã bị khóa vĩnh viễn!",
                "Tài khoản của bạn đã bị khóa vĩnh viễn do vi phạm nghiêm trọng quy định cộng đồng.",
                com.cdweb.be.enums.NotificationType.ACCOUNT_BANNED, null
            );
        } else if ("UNBAN".equalsIgnoreCase(action)) {
            user.setIsBanned(false);
            user.setIsActive(true);
            user.setBannedUntil(null);
            log.info("Admin unbanned user id: {}", id);

            notificationService.sendNotification(
                user.getId(), null,
                "Tài khoản của bạn đã được mở khóa!",
                "Tài khoản của bạn đã được Ban Quản Trị mở khóa. Bạn có thể tiếp tục sử dụng các dịch vụ của SportMate.",
                com.cdweb.be.enums.NotificationType.ACCOUNT_UNBANNED, null
            );
        } else {
            throw new AppException(HttpStatus.BAD_REQUEST, "Hành động không hợp lệ");
        }
        
        userRepository.save(user);
        return ResponseEntity.ok("Thành công");
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<com.cdweb.be.dto.response.AdminUserDetailDto> getUserDetails(HttpServletRequest request, @PathVariable Integer id) {
        requireAdminId(request);
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
        
        AdminUserDto profile = AdminUserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().name() : "user")
                .avatarUrl(user.getAvatarUrl())
                .isActive(user.getIsActive())
                .isBanned(user.getIsBanned())
                .bannedUntil(user.getBannedUntil())
                .createdAt(user.getCreatedAt())
                .build();

        com.cdweb.be.entity.UserStat stat = userStatRepository.findByUserId(id).orElse(new com.cdweb.be.entity.UserStat());
        com.cdweb.be.dto.response.AdminUserDetailDto.UserStatDto statsDto = com.cdweb.be.dto.response.AdminUserDetailDto.UserStatDto.builder()
                .completedMatches(stat.getCompletedMatches())
                .noShows(stat.getNoShows())
                .reputationScore(stat.getReputationScore())
                .avgSkillScore(stat.getAvgSkillScore())
                .avgAttitudeScore(stat.getAvgAttitudeScore())
                .build();

        // Recent matches (limit to 5)
        org.springframework.data.domain.Pageable limit = org.springframework.data.domain.PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<com.cdweb.be.entity.Match> userMatches = matchRepository.findAllByHostUserId(id, limit);
        java.util.List<com.cdweb.be.dto.response.MatchDetailDto> recentMatches = userMatches.stream().map(m -> 
            com.cdweb.be.dto.response.MatchDetailDto.builder()
                .id(m.getId())
                .title(m.getTitle())
                .sport(m.getSport())
                .status(m.getStatus().name())
                .startTime(m.getStartTime())
                .build()
        ).collect(java.util.stream.Collectors.toList());

        java.util.List<com.cdweb.be.dto.response.FriendDto> friends = friendshipRepository.findAcceptedFriendships(id).stream().map(f -> {
            User friend = f.getRequester().getId().equals(id) ? f.getAddressee() : f.getRequester();
            return com.cdweb.be.dto.response.FriendDto.builder()
                    .userId(friend.getId())
                    .fullName(friend.getFullName())
                    .avatarUrl(friend.getAvatarUrl())
                    .build();
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(com.cdweb.be.dto.response.AdminUserDetailDto.builder()
                .profile(profile)
                .stats(statsDto)
                .recentMatches(recentMatches)
                .friends(friends)
                .build());
    }

    @PutMapping("/{id}/role")
    @Transactional
    public ResponseEntity<String> updateUserRole(HttpServletRequest request, @PathVariable Integer id, @RequestParam String role) {
        requireAdminId(request);
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
        if ("admin".equalsIgnoreCase(role)) {
            user.setRole(com.cdweb.be.enums.UserRole.admin);
        } else {
            user.setRole(com.cdweb.be.enums.UserRole.user);
        }
        userRepository.save(user);
        return ResponseEntity.ok("Cập nhật quyền thành công");
    }

    @PutMapping("/{id}/reputation")
    @Transactional
    public ResponseEntity<String> updateUserReputation(HttpServletRequest request, @PathVariable Integer id, @RequestParam Integer score) {
        requireAdminId(request);
        com.cdweb.be.entity.UserStat stat = userStatRepository.findByUserId(id)
                .orElseGet(() -> {
                    com.cdweb.be.entity.UserStat newStat = new com.cdweb.be.entity.UserStat();
                    newStat.setUser(userRepository.getReferenceById(id));
                    return newStat;
                });
        stat.setReputationScore(score);
        userStatRepository.save(stat);
        return ResponseEntity.ok("Cập nhật uy tín thành công");
    }
}
