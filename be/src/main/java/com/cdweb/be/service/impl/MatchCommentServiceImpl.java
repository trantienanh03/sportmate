package com.cdweb.be.service.impl;

import com.cdweb.be.dto.MatchCommentDto;
import com.cdweb.be.dto.request.MatchCommentRequestDto;
import com.cdweb.be.entity.Match;
import com.cdweb.be.entity.MatchComment;
import com.cdweb.be.entity.User;
import com.cdweb.be.exception.AppException;
import org.springframework.http.HttpStatus;
import com.cdweb.be.repository.MatchCommentRepository;
import com.cdweb.be.repository.MatchRepository;
import com.cdweb.be.repository.UserRepository;
import com.cdweb.be.service.MatchCommentService;
import com.cdweb.be.service.NotificationService;
import com.cdweb.be.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchCommentServiceImpl implements MatchCommentService {

    private final MatchCommentRepository matchCommentRepository;
    private final MatchRepository matchRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public List<MatchCommentDto> getCommentsByMatchId(Integer matchId) {
        if (!matchRepository.existsById(matchId)) {
            throw new AppException(HttpStatus.NOT_FOUND, "Match not found with id " + matchId);
        }
        // Chỉ lấy các bình luận gốc
        List<MatchComment> comments = matchCommentRepository.findByMatchIdAndParentCommentIsNullOrderByCreatedAtDesc(matchId);
        return comments.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MatchCommentDto addComment(Integer userId, MatchCommentRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found with id " + userId));

        Match match = matchRepository.findById(request.getMatchId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Match not found with id " + request.getMatchId()));

        MatchComment parent = null;
        Integer notificationRecipientId = null;
        String notificationMsg = "";

        if (request.getParentId() != null) {
            MatchComment originalParent = matchCommentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Parent comment not found"));
            
            notificationRecipientId = originalParent.getUser().getId();
            notificationMsg = user.getFullName() + " đã trả lời bình luận của bạn trong trận: " + match.getTitle();

            // Nếu muốn giới hạn 1 cấp (One level nesting), parent phải là root
            parent = originalParent;
            if (parent.getParentComment() != null) {
                parent = parent.getParentComment();
            }
        } else {
            notificationRecipientId = match.getHost().getId();
            notificationMsg = user.getFullName() + " đã bình luận về trận: " + match.getTitle();
        }

        MatchComment comment = MatchComment.builder()
                .match(match)
                .user(user)
                .content(request.getContent())
                .parentComment(parent)
                .build();

        MatchComment savedComment = matchCommentRepository.save(comment);
        
        // Gửi thông báo (chỉ gửi nếu người nhận khác người gửi)
        if (notificationRecipientId != null && !notificationRecipientId.equals(userId)) {
            notificationService.sendNotification(notificationRecipientId, userId, "Bình luận mới", notificationMsg, NotificationType.MATCH_COMMENT, match.getId());
        }

        MatchCommentDto dto = mapToDto(savedComment);
        final Integer currentMatchId = match.getId();

        // Broadcast sự kiện qua WebSocket (sau khi commit để tránh race condition)
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                messagingTemplate.convertAndSend("/topic/match/" + currentMatchId + "/comments", 
                    (Object) Map.of("type", "CREATE", "data", dto));
            }
        });

        return dto;
    }

    @Override
    @Transactional
    public MatchCommentDto updateComment(Integer userId, Long commentId, MatchCommentRequestDto request) {
        MatchComment comment = matchCommentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Comment not found with id " + commentId));
                
        if (!comment.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You do not have permission to edit this comment");
        }
        
        comment.setContent(request.getContent());
        MatchComment updatedComment = matchCommentRepository.save(comment);
        MatchCommentDto dto = mapToDto(updatedComment);
        final Integer currentMatchId = comment.getMatch().getId();

        // Broadcast
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                messagingTemplate.convertAndSend("/topic/match/" + currentMatchId + "/comments", 
                    (Object) Map.of("type", "UPDATE", "data", dto));
            }
        });

        return dto;
    }

    @Override
    @Transactional
    public void deleteComment(Integer userId, Long commentId) {
        MatchComment comment = matchCommentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Comment not found with id " + commentId));
                
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "User not found"));

        if (!comment.getUser().getId().equals(userId) && currentUser.getRole() != com.cdweb.be.enums.UserRole.admin) {
            throw new AppException(HttpStatus.FORBIDDEN, "You do not have permission to delete this comment");
        }
        
        Integer matchId = comment.getMatch().getId();
        final Long parentId = comment.getParentComment() != null ? comment.getParentComment().getId() : null;
        matchCommentRepository.delete(comment);

        // Broadcast
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                messagingTemplate.convertAndSend("/topic/match/" + matchId + "/comments", 
                    (Object) Map.of("type", "DELETE", "commentId", commentId, "parentId", parentId));
            }
        });
    }

    private MatchCommentDto mapToDto(MatchComment comment) {
        List<MatchCommentDto> repliesDto = null;
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            repliesDto = comment.getReplies().stream()
                    .map(reply -> MatchCommentDto.builder()
                            .id(reply.getId())
                            .matchId(reply.getMatch().getId())
                            .userId(reply.getUser().getId())
                            .userName(reply.getUser().getFullName())
                            .userAvatarUrl(reply.getUser().getAvatarUrl())
                            .content(reply.getContent())
                            .parentId(reply.getParentComment() != null ? reply.getParentComment().getId() : null)
                            .createdAt(reply.getCreatedAt())
                            .build())
                    .collect(Collectors.toList());
            // Sort replies ASC (older replies first)
            repliesDto.sort(Comparator.comparing(MatchCommentDto::getCreatedAt));
        }

        return MatchCommentDto.builder()
                .id(comment.getId())
                .matchId(comment.getMatch().getId())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getFullName())
                .userAvatarUrl(comment.getUser().getAvatarUrl())
                .content(comment.getContent())
                .parentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .replies(repliesDto)
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
