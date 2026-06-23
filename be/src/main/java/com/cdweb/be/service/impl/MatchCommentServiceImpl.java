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
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        if (request.getParentId() != null) {
            parent = matchCommentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Parent comment not found"));
            // Nếu muốn giới hạn 1 cấp (One level nesting), parent phải là root
            if (parent.getParentComment() != null) {
                parent = parent.getParentComment();
            }
        }

        MatchComment comment = MatchComment.builder()
                .match(match)
                .user(user)
                .content(request.getContent())
                .parentComment(parent)
                .build();

        MatchComment savedComment = matchCommentRepository.save(comment);
        MatchCommentDto dto = mapToDto(savedComment);

        // Broadcast sự kiện qua WebSocket
        messagingTemplate.convertAndSend("/topic/match/" + match.getId() + "/comments", 
            (Object) Map.of("type", "CREATE", "data", dto));

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

        // Broadcast
        messagingTemplate.convertAndSend("/topic/match/" + comment.getMatch().getId() + "/comments", 
            (Object) Map.of("type", "UPDATE", "data", dto));

        return dto;
    }

    @Override
    @Transactional
    public void deleteComment(Integer userId, Long commentId) {
        MatchComment comment = matchCommentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Comment not found with id " + commentId));
                
        if (!comment.getUser().getId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You do not have permission to delete this comment");
        }
        
        Integer matchId = comment.getMatch().getId();
        matchCommentRepository.delete(comment);

        // Broadcast
        messagingTemplate.convertAndSend("/topic/match/" + matchId + "/comments", 
            (Object) Map.of("type", "DELETE", "commentId", commentId, "parentId", comment.getParentComment() != null ? comment.getParentComment().getId() : null));
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
